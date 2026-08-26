# Czuła Podróż

Strona prezentacyjno-sprzedażowa kameralnych wyjazdów psychologiczno-seksuologicznych.
Frontend w **Next.js 15 (App Router)** + **GSAP / ScrollTrigger** + **Lenis** (płynny scroll),
stylowany **Tailwind CSS 4**. Backend (płatności, rezerwacje, lista rezerwowa) powstanie
osobno w **Spring Boot** — warstwa danych jest już przygotowana pod podmianę na API.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produkcyjny
```

## Struktura

```
src/
├─ app/
│  ├─ layout.tsx              # fonty, metadata, providery, Header
│  ├─ page.tsx                # strona główna (sekcje 1–8)
│  ├─ fonts.ts                # Fraunces (serif à la Anthropic) + Dancing Script + Inter
│  ├─ globals.css             # design tokeny (paleta ivory/beż/sage/blush)
│  ├─ faq/page.tsx            # FAQ
│  ├─ regulamin/page.tsx      # szkielet regulaminu sklepu
│  └─ wyjazdy/[slug]/page.tsx # strona pojedynczego wyjazdu (SSG)
│
├─ components/
│  ├─ layout/    Header, Footer, CookieConsent, ContactPopup (pływające „Masz pytania?”)
│  ├─ sections/  Hero (karuzela), About, Destinations (kafelki + kategorie),
│  │             Itinerary (oś czasu dzień-po-dniu + „W cenie” + gift bag),
│  │             WhyUs (rozwijane kafelki), Hosts (Wiki & Natka), CtaJoin, Social
│  ├─ shop/      CartDrawer („Mój wyjazd”), BookingBox, WaitlistModal (lista rezerwowa)
│  ├─ providers/ AppProviders, SmoothScroll (Lenis+GSAP), CartContext
│  ├─ anim/      Reveal (wejścia przy scrollu)
│  └─ ui/        Button, Icon
│
└─ lib/
   ├─ data/      trips.ts (model + dane), site.ts (marka, nav, reasons, hosts), faq.ts
   └─ clsx.ts
```

## Co działa (frontend)

- Karuzela hero z auto-przewijaniem i animacją treści (GSAP).
- Płynny scroll (Lenis) zsynchronizowany ze ScrollTrigger; wejścia sekcji; animowana oś czasu.
- Kafelki ofert z filtrem po kontynencie i statusami (wolne / ostatnie / brak miejsc).
- Koszyk „Chcę jechać!” z wyborem **zadatek / całość** (localStorage).
- Lista rezerwowa (modal), baner cookies, pływający kontakt, menu mobilne.
- Strony pojedynczych wyjazdów (SSG z `generateStaticParams`).
- Pełna responsywność i obsługa `prefers-reduced-motion`.

## Do podłączenia później (backend Spring Boot)

Miejsca oznaczone `TODO` / zaślepki `alert(...)`:

- `CartDrawer` → utworzenie zamówienia + przekierowanie do płatności (Przelewy24 / Stripe).
- `WaitlistModal` → zapis na listę rezerwową (POST).
- `lib/data/trips.ts` → `getTrips()` / `getTripBySlug()` do podmiany na `fetch` z API
  (typy `Trip` zaprojektowane „API-friendly”).

## Materiały do dostarczenia przez klientki

- Zdjęcia (hero, destynacje, Wiki & Natka) — teraz placeholdery z Unsplash
  (whitelista w `next.config.ts`).
- Finalne opisy wyjazdów, ceny, terminy.
- Treść regulaminu i polityki prywatności.
