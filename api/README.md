# Czuła Podróż — API

Backend rezerwacji wyjazdów: katalog z planem dzień po dniu, koszyk z realną
blokadą miejsc, zamówienia, płatności, lista rezerwowa i podgląd rezerwacji.

**Stos:** Java 21 · Spring Boot 4.1 (Spring Framework 7, Spring Security 7) ·
Hibernate 7 · Liquibase · PostgreSQL (produkcja) / H2 (lokalnie i testy) ·
springdoc-openapi.

## Uruchomienie

### Najszybciej — bez żadnej infrastruktury

```bash
cd api
./mvnw spring-boot:run        # albo: mvn spring-boot:run
```

Profil `local` (domyślny) uruchamia bazę H2 w pliku `./.data`, wgrywa schemat
i przykładowe wyjazdy, włącza atrapę bramki płatniczej i zakłada konto
organizatorki `admin@czulapodroz.pl` / `CzulaPodroz2026!`.

- API: <http://localhost:8080/api/v1/trips>
- Dokumentacja: <http://localhost:8080/swagger-ui.html>
- Health: <http://localhost:8080/actuator/health>

> **Pierwsze uruchomienie po przejściu z Flywaya — skasuj `api/.data`.**
>
> ```bash
> rm -rf api/.data && cd api && ./mvnw clean package
> ```
>
> Stara baza lokalna była zakładana z `DATABASE_TO_LOWER=TRUE`, więc ma schemat
> zapisany małymi literami (`public`). Nowy adres tej flagi nie ustawia i H2 nie
> otworzy takiego pliku — wywala się już przy wczytywaniu, na odtwarzaniu
> własnych metadanych:
> `Schema "public" not found ... CREATE CACHED TABLE "public"."flyway_schema_history"`.
> To dane wyłącznie deweloperskie (`.data` jest w `.gitignore`), odtwarzają się
> z seeda przy następnym starcie. `clean` jest tu równie ważny jak skasowanie
> bazy: bez niego na ścieżce klas zostaje stary `flyway-core` i to on, a nie
> Liquibase, próbuje prowadzić migracje.

### Na PostgreSQL-u

```bash
docker compose up -d db
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

albo wszystko w kontenerach: `docker compose up --build`.

### Testy

```bash
mvn test
```

## Struktura — pakiet po funkcji

Każda funkcja trzyma komplet swoich klas w jednym pakiecie (encje, repozytoria,
serwisy, kontrolery, DTO). Zależności idą w jedną stronę: `catalog` nie wie nic
o `cart`, `cart` nie wie o `order`, a `payment` sięga do `order` wyłącznie przez
wąski `OrderPaymentService`.

```
pl.czulapodroz.api
├─ common/       wspólny fundament: BaseEntity, błędy API, konfiguracja, zegar
├─ catalog/      wyjazdy, destynacje, plan dzień po dniu, panel administracyjny
├─ inventory/    miejsca: blokady, dostępność, wygasanie   ← serce rezerwacji
├─ cart/         koszyk „Mój wyjazd" z blokadą miejsc
├─ order/        zamówienia, rezerwacje klientek
├─ payment/      port bramki płatniczej + atrapa na development
├─ waitlist/     lista rezerwowa
└─ auth/         konta, JWT, rotacja tokenów odświeżających
```

## Jak działa blokowanie miejsc

Dodanie wyjazdu do koszyka to nie deklaracja chęci, tylko realna rezerwacja:

1. `POST /api/v1/carts/{id}/items` pobiera wiersz wyjazdu **z blokadą**
   (`SELECT … FOR UPDATE` — `TripRepository.lockById`).
2. Pod tą blokadą liczymy dostępność: `capacity − opłacone − trzymane w innych
   koszykach`, i dopiero wtedy zapisujemy `SeatHold` z terminem ważności
   (domyślnie 20 minut).
3. Dwie klientki nie mogą więc zobaczyć tego samego ostatniego miejsca —
   druga dostaje `409 seats.unavailable` wraz z liczbą wolnych miejsc.
4. Złożenie zamówienia potwierdza blokady jeszcze raz (od dodania do koszyka
   mogło minąć sporo czasu) i przedłuża je na czas płatności.
5. Dopiero potwierdzona płatność zamienia blokadę w miejsce zajęte na stałe
   (`booked_seats`). Nieopłacone zamówienia wygasają i zwracają miejsca.

Status wyjazdu (`open` / `few-left` / `soldout`) nie jest przechowywany —
wynika z bieżącej dostępności, więc nie da się go „zapomnieć" zaktualizować.

## Ścieżka zakupu (to, co woła frontend)

| Krok | Wywołanie |
| --- | --- |
| 1. Katalog | `GET /api/v1/trips`, `GET /api/v1/trips/{slug}` |
| 2. Koszyk | `POST /api/v1/carts` → `POST /api/v1/carts/{id}/items` |
| 3. Odświeżenie przed kasą | `POST /api/v1/carts/{id}/refresh` |
| 4. Zamówienie | `POST /api/v1/orders` → zwraca `accessToken` (jedyny raz) |
| 5. Płatność | `POST /api/v1/payments` → `redirectUrl` operatora |
| 6. Powrót operatora | webhook `POST /api/v1/payments/webhook` |
| 7. Rezerwacja | `GET /api/v1/reservations/{numer}?token=…` |

Bez wolnych miejsc zostaje `POST /api/v1/waitlist`.

## Bezpieczeństwo

- **Token dostępowy**: JWT HS256, 15 minut, w nagłówku `Authorization: Bearer`.
- **Token odświeżający**: losowy, 14 dni, w bazie tylko jako SHA-256.
  Każde użycie go rotuje. Użycie tokenu już zrotowanego oznacza kradzież —
  unieważniamy wtedy całą rodzinę tokenów z tego logowania.
- **Rezerwacja bez konta**: token z linku, również trzymany jako skrót.
  Zły token daje `404`, nie `403` — inaczej dałoby się sprawdzać, które numery
  zamówień istnieją.
- **Panel**: `/api/v1/admin/**` wymaga roli `ADMIN`.
- Logowanie nie rozróżnia „złe hasło" od „nie ma takiego konta".

## Płatności

`PaymentGateway` to port — reszta systemu nie wie, kto obsługuje przelew.
Domyślna implementacja (`mock`) hostuje własną stronę płatności pod
`/api/v1/payments/mock/{id}`, więc cała ścieżka zakupu jest przeklikalna
lokalnie. Podłączenie Przelewów24 albo Stripe'a to nowa implementacja
`PaymentGateway` i zmiana `czula.payments.provider`.

## Konfiguracja

| Zmienna | Znaczenie |
| --- | --- |
| `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` | baza (profil `prod`/`postgres`) |
| `JWT_SECRET` | klucz HMAC, min. 32 znaki — **wymagany w produkcji** |
| `FRONTEND_BASE_URL` | adres frontendu (linki do rezerwacji) |
| `API_BASE_URL` | publiczny adres API (powroty z bramki) |
| `CORS_ALLOWED_ORIGINS` | dozwolone źródła przeglądarki, po przecinku |
| `PAYMENTS_PROVIDER` | `mock` albo docelowy operator |
| `PAYMENTS_WEBHOOK_SECRET` | sekret powiadomień operatora |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | konto organizatorki zakładane przy pierwszym starcie — w profilu `prod` trzeba podać OBA, inaczej konto nie powstanie |
| `LIQUIBASE_CONTEXTS` | konteksty migracji, domyślnie `prod` (bez danych przykładowych) |

Parametry rezerwacji (`czula.booking.*`): czas blokady w koszyku, okno
płatności, maksimum miejsc na jedną pozycję.

## Migracje schematu

Schemat prowadzi Liquibase. Wszystko wychodzi od
`src/main/resources/db/changelog/db.changelog-master.yaml`:

| Plik | Zawartość |
| --- | --- |
| `001-schema.yaml` | tabele katalogu, koszyka, zamówień, płatności, listy rezerwowej |
| `002-participants-and-messages.yaml` | uczestniczki, wiadomości, doręczenia |
| `900-seed-trips.yaml` | przykładowe wyjazdy, tylko w kontekście `seed` |

Kontekst jest podawany jawnie w każdym profilu (`spring.liquibase.contexts`),
bo Liquibase uruchomiony **bez** kontekstu wykonuje wszystkie zmiany — także
dane przykładowe. Produkcja jedzie na `prod` i dostaje sam schemat; `local`
i `postgres` mają `local,seed`, testy `test`.

Hibernate stoi na `ddl-auto: validate` — schemat pochodzi wyłącznie
z changelogów, nigdy z encji.

### Baza, która była wcześniej na Flyway

Jeśli baza ma już tabelę `flyway_schema_history` i komplet tabel, Liquibase
przy pierwszym uruchomieniu spróbowałby założyć je od nowa. Najpierw trzeba go
poinformować, że zmiany są już wgrane:

```bash
mvn liquibase:changelogSync \
  -Dliquibase.url=<jdbc-url> \
  -Dliquibase.username=<user> \
  -Dliquibase.password=<haslo> \
  -Dliquibase.contexts=prod
```

Polecenie tylko zapisuje changesety w `DATABASECHANGELOG`, nie rusza danych.
Potem `flyway_schema_history` można usunąć.

## Dane przykładowe

`db/changelog/seed/trips.sql` jest generowany z danych frontendu, żeby obie
strony pokazywały te same wyjazdy:

```bash
node api/tools/generate-seed.mjs   # uruchamiać z katalogu głównego repo
```

Plik wchodzi do bazy przez changeset `900-seed-trips.yaml`, czyli tylko
w profilach z kontekstem `seed` (`local`, `postgres`) — produkcja dostaje sam
schemat.

## Wdrożenie na Railway

W repozytorium są dwa pliki, które mówią Railwayowi, jak budować i wdrażać:

| Plik | Rola |
| --- | --- |
| `railway.json` | builder, health-check, polityka restartów, ścieżki wyzwalające |
| `.dockerignore` | co NIE ma iść do usługi budującej |

**Katalog główny usługi ustaw na `api`** (Settings → Source → Root Directory) —
stamtąd Railway czyta `railway.json`.

### Co robi `railway.json`

- `builder: DOCKERFILE` — budujemy z `Dockerfile`, bez zgadywania przez Nixpacks.
- `healthcheckPath: /actuator/health` — Railway przełączy ruch na nową wersję
  dopiero, gdy aplikacja odpowie, że wstała. Limit 300 s z zapasem na zimny
  start JVM i migracje Liquibase.
- `restartPolicyType: ON_FAILURE`, 3 próby — restart po awarii, ale bez
  zapętlania się w nieskończoność, gdy błąd jest w konfiguracji.
- `watchPatterns: ["api/**"]` — **oszczędza pieniądze**. To monorepo: bez tego
  każdy commit we frontendzie albo w panelu przebudowywałby również API, a
  Railway liczy za czas budowania.

> Jeśli po wypchnięciu zmian w `api/` nic się nie wdraża, a w logu widnieje
> „No changed files matched patterns", to znaczy, że wzorzec jest liczony
> względem katalogu usługi, nie repozytorium. Zamień wtedy `"api/**"` na `"**"`.

### Co robi `.dockerignore`

Kontekst budowania leci do Railwaya przy każdym wdrożeniu. Bez filtra byłoby to
76 MB — w tym `target/` (74 MB) i `.data/`, czyli twoja lokalna baza H2.
Z filtrem zostaje **1,2 MB**. Sprawdzone: z tak okrojonego kontekstu `mvn
package` przechodzi, więc nic potrzebnego nie zostało odcięte.

### Zmienne środowiskowe

```
SPRING_PROFILES_ACTIVE = prod
DATABASE_URL      = jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DATABASE_USER     = ${{Postgres.PGUSER}}
DATABASE_PASSWORD = ${{Postgres.PGPASSWORD}}
JWT_SECRET        = <openssl rand -base64 48>
ADMIN_EMAIL       = admin@czulapodroz.pl
ADMIN_PASSWORD    = <hasło startowe organizatorki>
FRONTEND_BASE_URL = https://czulapodroz.pl
API_BASE_URL      = https://api.czulapodroz.pl
CORS_ALLOWED_ORIGINS = https://czulapodroz.pl,https://admin.czulapodroz.pl
```

Wszystkie powyższe są **wymagane**. Profil `prod` celowo nie ma dla nich
wartości zapasowych: w pliku bazowym adresy domyślne wskazują `localhost`, bo
tam służą pracy na własnym komputerze. Gdyby produkcja je odziedziczyła, nic by
nie krzyknęło, a szkody byłyby ciche — linki do rezerwacji wysyłane klientkom
prowadziłyby na localhost, przeglądarka blokowałaby żądania z prawdziwej domeny,
a bramka wracałaby pod zły adres. Brak którejkolwiek zmiennej zatrzymuje start
z komunikatem wskazującym nazwę brakującej właściwości.

**Przedrostek `jdbc:` jest obowiązkowy.** Railway udostępnia własną zmienną
`DATABASE_URL` w formacie `postgresql://user:hasło@host/baza`, którego Spring
nie przyjmie — aplikacja pada wtedy na `Failed to determine a suitable driver
class`. Dlatego adres składamy z osobnych zmiennych bazy, a login i hasło
podajemy oddzielnie.

`PORT` wstrzykuje Railway — nie ustawiaj go ręcznie (aplikacja czyta
`${PORT:8080}`).

### Baza danych

**Bazy nie wdraża się z repozytorium.** `docker-compose.yml` w tym katalogu
służy wyłącznie do pracy lokalnej — na Railwayu PostgreSQL dodajesz jako
osobną usługę: **+ New → Database → PostgreSQL**, w tym samym projekcie co API.

Trzymanie jej w tym samym projekcie ma znaczenie: ruch idzie wtedy po sieci
wewnętrznej i nie liczy się jako transfer.

**Schematu też nie zakładasz ręcznie.** Przy pierwszym starcie API Liquibase
wykonuje 17 changesetów i tworzy komplet tabel. Kolejne starty nie robią nic —
sprawdzone na PostgreSQL-u 16: drugie uruchomienie wykonało 0 changesetów.

Typy abstrakcyjne z changelogów mapują się na natywne typy PostgreSQL-a
(`uuid`, `timestamp with time zone`, `numeric`, `date`), a `ddl-auto: validate`
przy starcie potwierdza, że encje zgadzają się ze schematem.

#### Konto do panelu

`ADMIN_EMAIL` **i** `ADMIN_PASSWORD` muszą być ustawione oba. Konto
organizatorki powstaje przy pierwszym starcie i bez niego nie ma się czym
zalogować do panelu — a więc nie da się dodać żadnego wyjazdu i katalog
zostaje pusty. Profil `prod` celowo nie ma tu wartości domyślnych: konto
z hasłem wpisanym w repozytorium byłoby gotowym wejściem dla każdego, kto zna
ten kod.

#### Kopie zapasowe

Railway robi migawki bazy, ale włącz je świadomie w ustawieniach usługi
PostgreSQL i sprawdź częstotliwość. Zrzut na własny dysk:

```bash
pg_dump "postgresql://user:hasło@host:port/baza" > czula-$(date +%F).sql
```

Dane połączenia znajdziesz w usłudze bazy, w zakładce Variables.

### Zużycie pamięci a rachunek

Railway rozlicza faktycznie zużytą pamięć, więc pilnuje jej `Dockerfile`:

```
ENV JAVA_OPTS="-XX:MaxRAM=512m -XX:MaxRAMPercentage=75"
```

Bez `MaxRAM` procent liczy się od pamięci, którą maszyna *widzi* — na hoście
z 15 GB daje to ~10 GB sterty. JVM z takim zapasem nie sprząta agresywnie,
tylko rośnie, a wraz z nią rachunek. Z sufitem sterta kończy się na 384 MB.

Zmierzone: **392 MB RSS** po starcie, **411 MB** po 500 żądaniach (50
równolegle), a po kolejnych 150 s pracy zadań cyklicznych **411 MB** — czyli
bez dalszego wzrostu. Zero `OutOfMemory`, health `UP`. Przy większym ruchu
podnieś przez zmienną `JAVA_OPTS`, np. `-XX:MaxRAM=1g`.

Drugi składnik rachunku to baza — trzymaj ją w tym samym projekcie, wtedy ruch
między usługami idzie po sieci wewnętrznej i nie liczy się jako transfer.

### Czego NIE da się tu oszczędzić

`SeatHoldExpiryScheduler` odpytuje bazę co minutę (`expiry-scan-interval:
PT1M`), bo zwalnia miejsca z porzuconych koszyków. To znaczy, że aplikacja
i baza pracują bez przerwy — plany „usypiające" (darmowy Render, Neon
z limitem godzin pracy) się tu nie nadają: albo wyczerpią limit w kilka dni,
albo uśpiona usługa przestanie zwalniać miejsca.

### Po wdrożeniu

```bash
curl https://api.czulapodroz.pl/actuator/health     # {"status":"UP"}
curl https://api.czulapodroz.pl/api/v1/trips        # [] — baza startuje pusta
```

Pusta lista jest poprawna: profil `prod` nie wgrywa danych przykładowych.
Wyjazdy dodajesz w panelu admina.

## Co zostało do zrobienia przed go-live

- Prawdziwy operator płatności (implementacja `PaymentGateway` + weryfikacja
  podpisu webhooka zgodnie z jego specyfikacją).
- Wysyłka e-maili (potwierdzenie rezerwacji z linkiem, przypomnienie o dopłacie).
- Panel administracyjny w UI — API (`/api/v1/admin/**`) już jest.
- Ograniczanie liczby żądań (rate limiting) na logowaniu i składaniu zamówień.
- Kopie zapasowe bazy i monitoring.
