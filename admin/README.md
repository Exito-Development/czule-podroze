# Czuła Podróż — panel organizatorek

Osobna aplikacja do prowadzenia wyjazdów: oferta, zamówienia, listy uczestniczek
i wysyłka wiadomości. Korzysta z tego samego API (`../api`) co strona sprzedażowa.

**Stos:** Next.js 15 (App Router), Tailwind 4, TypeScript. Aplikacja jest w pełni
kliencka — żadna strona nie renderuje danych po stronie serwera, bo wszystko
wymaga zalogowanej sesji.

## Uruchomienie

```bash
# 1. API (osobny terminal)
cd ../api && mvn spring-boot:run

# 2. Panel
npm install
npm run dev          # http://localhost:3003
```

Logowanie kontem organizatorki zakładanym przy pierwszym starcie API:
`admin@czulapodroz.pl` / `CzulaPodroz2026!` (hasło do zmiany po pierwszym
zalogowaniu — patrz `czula.admin.*` w konfiguracji API).

Adres API bierzemy z `NEXT_PUBLIC_API_URL` — patrz [`.env.example`](.env.example).

## Co panel potrafi

**Pulpit** — sprzedane miejsca, wpłacone pieniądze, kwoty do dopłaty i to, co
wymaga uwagi (zamówienia bez płatności, miejsca bez danych osoby). Do tego
zapełnienie każdego wyjazdu i ostatnie zamówienia.

**Wyjazdy** — dodawanie i edycja oferty: termin, cena, zadatek, liczba miejsc,
lista „w cenie", destynacje i publikacja. Osobny edytor **planu dzień po dniu**
z kolejnością dni i tagami — to on rysuje pionową oś czasu na stronie wyjazdu.

**Uczestniczki** — jeden wiersz na jedno kupione miejsce. Dane zna tylko osoba
rezerwująca, więc pozostałe miejsca są oznaczone jako „do uzupełnienia" i czekają
na dane od organizatorek. Do tego uwagi (dieta, alergie), rezygnacje i eksport
listy do CSV przed wyjazdem.

**Zamówienia** — filtrowanie i szukanie, szczegóły rezerwacji, ręczne
zaksięgowanie wpłaty (przelew tradycyjny) oraz anulowanie nieopłaconych.

**Wiadomości** — wysyłka do wybranej grupy: uczestniczki, zalegające z dopłatą,
oczekujące na płatność, lista rezerwowa. Przed wysłaniem widać dokładnie, kto to
dostanie. Treść obsługuje podstawienia `{{imie}}`, `{{wyjazd}}`,
`{{numer_rezerwacji}}`, `{{do_doplaty}}`. Historia pokazuje wynik każdego
doręczenia z osobna — widać, do kogo wiadomość nie doszła.

**Lista rezerwowa** — kolejka oczekujących na każdy wyjazd.

## Sesja i bezpieczeństwo

- Token dostępowy żyje **wyłącznie w pamięci**; w `localStorage` zostaje tylko
  token odświeżający, którym nie da się bezpośrednio wołać API.
- Po odświeżeniu strony sesja odtwarza się z tokenu odświeżającego.
- Odświeżenia idą **jednym strumieniem**: API rotuje tokeny i traktuje ponowne
  użycie zużytego jako kradzież, więc dwa równoległe odświeżenia wylogowałyby
  organizatorkę w środku pracy.
- Konto bez roli `ADMIN` nie zostaje wpuszczone do panelu, a każdy endpoint
  `/api/v1/admin/**` i tak sprawdza uprawnienia po stronie serwera.

## Struktura

```
src/
├─ app/
│  ├─ page.tsx                    # pulpit
│  ├─ logowanie/
│  ├─ wyjazdy/                    # lista, nowy, [slug] z zakładkami
│  ├─ zamowienia/                 # lista i [orderNumber]
│  ├─ wiadomosci/                 # historia wszystkich wysyłek
│  └─ lista-rezerwowa/
│
├─ components/
│  ├─ layout/Shell.tsx            # nawigacja i rama panelu
│  ├─ providers/AuthProvider.tsx  # sesja organizatorki
│  ├─ trips/                      # TripForm, ItineraryEditor,
│  │                              # ParticipantsTab, MessagesTab
│  └─ ui/                         # Button, Card, Badge, Field, Modal, Tabs…
│
└─ lib/
   ├─ api/                        # klient z rotacją tokenów + typy DTO
   ├─ hooks/useAsync.ts           # pobieranie danych ze stanem ładowania
   └─ format.ts                   # kwoty, daty i polska odmiana liczebników
```

## Wdrożenie

`npm run build && npm run start` (port 3003). Panel powinien stać za osobną
subdomeną i — jeśli to możliwe — za dodatkową warstwą ograniczenia dostępu
(VPN, lista adresów IP albo Basic Auth na poziomie serwera WWW). Adres panelu
trzeba dopisać do `CORS_ALLOWED_ORIGINS` w konfiguracji API.
