# Czuła Podróż

Strona i system rezerwacji kameralnych wyjazdów psychologiczno-seksuologicznych.

Repozytorium zawiera dwie części:

| Katalog | Co to jest | Stos |
| --- | --- | --- |
| `/` (korzeń) | frontend — strona ofertowa i proces zakupu | Next.js 15 (App Router), Tailwind 4, GSAP + Lenis |
| `api/` | backend — katalog, koszyk z blokadą miejsc, zamówienia, płatności | Java 21, Spring Boot 4.1, PostgreSQL / H2, Flyway |

Szczegóły backendu: [`api/README.md`](api/README.md).

## Uruchomienie

```bash
# 1. Backend (osobny terminal) — działa bez żadnej infrastruktury
cd api && mvn spring-boot:run

# 2. Frontend
npm install
npm run dev            # http://localhost:3002
```

Frontend znajduje API pod `http://localhost:8080`. Inny adres podaje się przez
`NEXT_PUBLIC_API_URL` — patrz [`.env.example`](.env.example).

Bez uruchomionego backendu strona ofertowa nadal działa (dane statyczne
z `src/lib/data/trips.ts`), ale koszyk i rezerwacje zgłaszają, że system
rezerwacji jest niedostępny — nikt nie kupi miejsca „na ślepo".

```bash
npm run build          # build produkcyjny
cd api && mvn test     # testy backendu
```

## Struktura frontendu

```
src/
├─ app/
│  ├─ layout.tsx                 # fonty, metadata, providery, Header
│  ├─ page.tsx                   # strona główna (pobiera ofertę z API, ISR 60 s)
│  ├─ wyjazdy/[slug]/page.tsx    # strona pojedynczego wyjazdu
│  ├─ zamowienie/page.tsx        # kasa — dane klientki i przejście do płatności
│  ├─ rezerwacja/page.tsx        # rezerwacje zapisane w tej przeglądarce
│  ├─ rezerwacja/[orderNumber]/  # „Moja rezerwacja" — status, plan, pobranie
│  ├─ faq, regulamin
│  └─ globals.css                # design tokeny (ivory/beż/sage/blush)
│
├─ components/
│  ├─ layout/    Header, Footer, FooterReveal, ContactPopup, CookieConsent
│  ├─ sections/  Hero, About, Destinations, TripTimeline, Workshops,
│  │             WhyUs, Hosts, CtaJoin, Social, Marquee
│  ├─ shop/      CartDrawer, BookingBox, CheckoutView, ReservationView,
│  │             WaitlistModal, HoldCountdown
│  ├─ trips/     TripSpine (mini-oś czasu na kafelku)
│  ├─ providers/ AppProviders, SmoothScroll, CartContext, TripFocusContext
│  ├─ anim/      Reveal, ParallaxImg, TiltCard, RouteTransition
│  └─ ui/        Button, Icon, MixedTitle, WaveDivider
│
└─ lib/
   ├─ api/       klient REST do backendu (+ typy DTO)
   ├─ data/      statyczny fallback oferty, treści marki, FAQ
   └─ scroll, itinerary, reservations, clsx
```

## Jak to działa

**Oferta.** Strona główna pobiera wyjazdy z API (ISR co 60 s). Gdy backend nie
odpowiada, renderuje dane statyczne — awaria nie gasi prezentacji oferty.

**Oś czasu.** Każdy wyjazd ma własny plan dzień po dniu. Wskazanie kafelka
pokazuje mini-oś na okładce (`TripSpine`), a sekcja „Plan podróży"
(`TripTimeline`) przerysowuje się na wskazany wyjazd: linia wyrasta od nowa,
dni wjeżdżają kaskadowo, a delfin płynie po osi razem ze scrollem.

**Przejścia.** `RouteTransition` przechwytuje kliknięcia w wewnętrzne linki
i zasłania ekran kurtyną z nazwą oraz okładką wyjazdu, zanim nastąpi nawigacja.

**Koszyk.** Mieszka po stronie API — dodanie wyjazdu naprawdę blokuje miejsca
na czas zakupów. Przeglądarka trzyma tylko identyfikator koszyka. Szuflada
odświeża dostępność po otwarciu i co 30 sekund oraz odlicza czas do wygaśnięcia
blokady.

**Zakup.** `/zamowienie` → dane klientki → `POST /api/v1/orders` → przekierowanie
do operatora płatności → powrót na `/rezerwacja/{numer}`, gdzie widać status,
rozliczenie, pełny plan wyjazdu i przycisk pobrania szczegółów. Token dostępu
do rezerwacji (API pokazuje go tylko raz) zapisujemy w przeglądarce, więc
`/rezerwacja` działa jak lista „moich wyjazdów" bez zakładania konta.

**Brak miejsc.** Kafelek proponuje listę rezerwową; API odpowiada numerem
w kolejce.

## Dostępność i wydajność

- Wszystkie animacje szanują `prefers-reduced-motion`.
- Kafelek wyjazdu używa „rozciągniętego" linku, więc nie zagnieżdżamy
  przycisków w `<a>` i klawiatura działa naturalnie.
- Zakładki warsztatów leżą w jednej komórce siatki — zmiana zakładki nie
  zmienia wysokości sekcji, więc tło nie skacze.

## Materiały do dostarczenia przez klientki

- Zdjęcia (hero, destynacje, Wiki & Natka) — teraz placeholdery z Unsplash
  (whitelista w `next.config.ts`), wideo hero: `/public/media/hero.mp4`.
- Finalne opisy wyjazdów, ceny, terminy (do wprowadzenia przez API/panel).
- Treść regulaminu i polityki prywatności.

## Przed go-live

- Podłączenie prawdziwego operatora płatności (patrz `api/README.md`).
- Wysyłka e-maili z potwierdzeniem rezerwacji.
- Panel administracyjny w UI — API (`/api/v1/admin/**`) jest gotowe.
- Domena, HTTPS, `CORS_ALLOWED_ORIGINS` i `JWT_SECRET` ze zmiennych środowiskowych.
