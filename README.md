# Czuła Podróż

Strona i system rezerwacji kameralnych wyjazdów psychologiczno-seksuologicznych.

Repozytorium zawiera trzy aplikacje:

| Katalog | Co to jest | Stos | Port |
| --- | --- | --- | --- |
| `/` (korzeń) | strona ofertowa i proces zakupu | Next.js 15, Tailwind 4, GSAP + Lenis | 3002 |
| `api/` | backend: katalog, koszyk z blokadą miejsc, zamówienia, płatności, wiadomości | Java 21, Spring Boot 4.1, PostgreSQL / H2 | 8080 |
| `admin/` | panel organizatorek: oferta, zamówienia, uczestniczki, wysyłki | Next.js 15, Tailwind 4 | 3003 |

Szczegóły: [`api/README.md`](api/README.md) · [`admin/README.md`](admin/README.md).

## Uruchomienie

```bash
# 1. Backend (osobny terminal) — działa bez żadnej infrastruktury
cd api && mvn spring-boot:run

# 2. Strona
npm install
npm run dev            # http://localhost:3002

# 3. Panel organizatorek (opcjonalnie, osobny terminal)
cd admin && npm install && npm run dev    # http://localhost:3003
```

Do panelu logujesz się kontem zakładanym przy pierwszym starcie API:
`admin@czulapodroz.pl` / `CzulaPodroz2026!`.

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

## SEO

### Co jest w kodzie

| Element | Gdzie | Po co |
| --- | --- | --- |
| Adres witryny | `NEXT_PUBLIC_SITE_URL`, `src/lib/seo.ts` | Źródło wszystkich adresów absolutnych |
| Adresy kanoniczne | `alternates.canonical` na każdej stronie | Ucinają duplikaty (`/`, `/?utm_source=…`) |
| Mapa strony | `src/app/sitemap.ts` | Wyjazdy ciągnie z API — nowa oferta trafia tam sama |
| Reguły robotów | `src/app/robots.ts` | Wpuszcza treść, blokuje koszyk i rezerwacje |
| Dane strukturalne | `src/lib/schema.ts` | Cena, termin i dostępność w wyniku wyszukiwania |
| Podgląd linku | `src/app/opengraph-image.tsx` (+ wersja dla wyjazdu) | Obrazek przy wklejeniu linku |
| Ikona, manifest | `src/app/icon.tsx`, `src/app/manifest.ts` | Karta przeglądarki, dodanie do ekranu głównego |

Panel admina (`admin/`) ma własny `robots.ts` blokujący wszystko oraz
`noindex` w metadanych — nie ma go w wynikach wyszukiwania.

**Adres witryny trzeba ustawić w środowisku.** Domyślny to
`https://czulapodroz.pl`; środowisko testowe musi mieć własny, inaczej Google
zindeksuje testy jako produkcję.

### Strony pod frazy branżowe

`/warsztaty` opisuje to, co dzieje się na wyjazdach — bo frazy w rodzaju
„warsztaty dla kobiet", „warsztaty seksuologiczne" czy „mindfulness" nie miały
wcześniej na czym rankować: strona główna mówi o wyjazdach, nie o ich treści.

Tekst jest pisany pod pytania, z którymi ludzie faktycznie przychodzą, a nie
pod upychanie fraz — to drugie działa dziś przeciw stronie. FAQ zostało
rozszerzone o pytania w formie, w jakiej trafiają do wyszukiwarki („czy mogę
przyjechać sama", „czym to się różni od babskiego wyjazdu").

### Czego kod nie załatwi

Sama strona nie sprawi, że pojawisz się w Google. Po wdrożeniu:

1. **Google Search Console** — dodaj domenę (<https://search.google.com/search-console>),
   potwierdź własność wpisem DNS, wyślij `https://czulapodroz.pl/sitemap.xml`.
   Bez tego czekasz, aż Google znajdzie stronę sam; z tym trwa to dni, nie tygodnie.
2. **Profil Firmy w Google** — dla fraz typu „wyjazdy dla kobiet" z okolicy.
3. **Linki z zewnątrz** — Instagram, Facebook, katalogi wyjazdów, wywiady.
   To najmocniejszy czynnik, na jaki masz wpływ, i jedyny, którego nie da się
   zrobić w kodzie.
4. **Treść** — strona ma dziś trzy wyjazdy i FAQ. Google potrzebuje tekstu,
   żeby mieć co pokazać. Blog albo rozbudowane opisy warsztatów dają frazy,
   pod którymi ktoś faktycznie szuka („wyjazd po rozstaniu", „retreat dla
   kobiet Zanzibar").

### Sprawdzenie po wdrożeniu

```bash
curl -s https://czulapodroz.pl/robots.txt
curl -s https://czulapodroz.pl/sitemap.xml
```

Dane strukturalne: <https://search.google.com/test/rich-results>.
Podgląd linku: <https://www.opengraph.xyz/>.

## Przed go-live

- Podłączenie prawdziwego operatora płatności (patrz `api/README.md`).
- Ustawienie wysyłki SMTP (`czula.messaging.provider=smtp`) — bez tego
  wiadomości z panelu trafiają tylko do logu.
- Automatyczny e-mail z potwierdzeniem rezerwacji po opłaceniu.
- Domena, HTTPS, `CORS_ALLOWED_ORIGINS` i `JWT_SECRET` ze zmiennych środowiskowych.
- Panel za osobną subdomeną i dodatkową warstwą ograniczenia dostępu.
- `NEXT_PUBLIC_SITE_URL` ustawione na prawdziwą domenę, a strona zgłoszona
  w Google Search Console (patrz „SEO" wyżej).
