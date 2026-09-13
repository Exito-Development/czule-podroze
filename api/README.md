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
| `ADMIN_PASSWORD` | hasło startowe konta organizatorki |
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

## Co zostało do zrobienia przed go-live

- Prawdziwy operator płatności (implementacja `PaymentGateway` + weryfikacja
  podpisu webhooka zgodnie z jego specyfikacją).
- Wysyłka e-maili (potwierdzenie rezerwacji z linkiem, przypomnienie o dopłacie).
- Panel administracyjny w UI — API (`/api/v1/admin/**`) już jest.
- Ograniczanie liczby żądań (rate limiting) na logowaniu i składaniu zamówień.
- Kopie zapasowe bazy i monitoring.
