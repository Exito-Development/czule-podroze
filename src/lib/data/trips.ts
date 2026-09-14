/**
 * Warstwa danych — statyczny fallback.
 *
 * Docelowo te dane serwuje backend (Spring Boot, katalog `api/`) przez REST.
 * Kształt typów jest celowo "API-friendly" i odpowiada 1:1 DTO z `/api/v1/trips`,
 * więc podmiana źródła (patrz `src/lib/api/trips.ts`) nie wymusza zmian
 * w komponentach. Gdy API jest nieosiągalne, strona renderuje te dane.
 */

export type Continent = "Azja" | "Afryka" | "Europa";

export type TripStatus = "open" | "few-left" | "soldout" | "upcoming";

export interface TripDay {
  /** Numer dnia, np. 1 */
  day: number;
  /** Krótki tytuł dnia */
  title: string;
  /** Opis agendy danego dnia */
  description: string;
  /** Tagi aktywności: warsztat / fitness / wycieczka / relaks / kolacja */
  tags?: string[];
}

export interface TripDestination {
  /** Nazwa lokalizacji, np. "Koh Samui" */
  name: string;
  /** Zakres dni, np. "Dni 1–5" */
  dayRange: string;
  /** Krótki opis */
  description: string;
  /** URL zdjęcia (placeholder Unsplash do czasu materiałów klientek) */
  image: string;
}

export interface Trip {
  /** Identyfikator w URL, np. "tajlandia-bali" */
  slug: string;
  /** Nazwa wyjazdu */
  title: string;
  /** Krótkie hasło / podtytuł */
  tagline: string;
  /** Kontynent — do filtrowania ofert */
  continent: Continent;
  /** Kraj */
  country: string;
  /** Liczba dni */
  durationDays: number;
  /** Data startu (ISO) */
  startDate: string;
  /** Data końca (ISO) */
  endDate: string;
  /** Cena całkowita w PLN */
  price: number;
  /** Wysokość zadatku w PLN */
  deposit: number;
  /** Maksymalna liczba miejsc */
  capacity: number;
  /** Liczba zajętych miejsc */
  booked: number;
  /** Status sprzedaży */
  status: TripStatus;
  /** Główne zdjęcie (hero / kafelek) */
  coverImage: string;
  /** Lokalizacje w ramach jednego wyjazdu */
  destinations: TripDestination[];
  /** Co wchodzi w cenę */
  included: string[];
  /** Pionowa oś czasu — dzień po dniu */
  itinerary: TripDay[];
}

export const trips: Trip[] = [
  {
    slug: "tajlandia-bali",
    title: "Tajlandia & Bali",
    tagline: "Trzy raje, jedna czuła podróż.",
    continent: "Azja",
    country: "Tajlandia / Indonezja",
    durationDays: 15,
    startDate: "2026-10-04",
    endDate: "2026-10-18",
    price: 14900,
    deposit: 2000,
    capacity: 10,
    booked: 6,
    status: "few-left",
    coverImage:
      "https://images.unsplash.com/photo-1537956965359-7573183d1f57?q=80&w=1600&auto=format&fit=crop",
    destinations: [
      {
        name: "Koh Samui",
        dayRange: "Dni 1–5",
        description:
          "Miękkie wejście w podróż — plaża, oddech, pierwsze warsztaty i poznanie grupy.",
        image:
          "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Krabi",
        dayRange: "Dni 6–10",
        description:
          "Wapienne klify, długie łodzie i głębsza praca warsztatowa w sercu Andamanów.",
        image:
          "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Bali",
        dayRange: "Dni 11–15",
        description:
          "Zielone tarasy ryżowe, joga o świcie i domknięcie wspólnej historii.",
        image:
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    included: [
      "Warsztaty psychologiczne i seksuologiczne prowadzone przez Wikę i Natkę",
      "Wszystkie noclegi w starannie wybranych miejscach",
      "Codzienne zajęcia fitness / joga",
      "Gift bag powitalny",
      "Lokalne wycieczki i atrakcje z agendy",
      "Opieka i koordynacja organizatorek 24/7",
    ],
    itinerary: [
      {
        day: 1,
        title: "Powitanie na Koh Samui",
        description:
          "Transfer z lotniska, zakwaterowanie, wieczór zapoznawczy i rozdanie gift bagów.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 2,
        title: "Warsztat otwarcia",
        description:
          "Pierwsza sesja warsztatowa: bezpieczna przestrzeń, kontrakt grupowy, intencje na podróż.",
        tags: ["warsztat"],
      },
      {
        day: 3,
        title: "Poranna joga & plaża",
        description:
          "Fitness o wschodzie słońca, dzień regeneracji nad wodą, wieczorny krąg dzielenia.",
        tags: ["fitness", "relaks"],
      },
      {
        day: 4,
        title: "Bliżej siebie",
        description:
          "Warsztat z obszaru psychoseksuologii — praca z ciałem, wstydem i granicami.",
        tags: ["warsztat"],
      },
      {
        day: 5,
        title: "Lokalna kultura",
        description:
          "Wycieczka po wyspie, lokalna kuchnia, targ i świątynie. Kolacja pożegnalna z Samui.",
        tags: ["wycieczka", "kultura"],
      },
      {
        day: 6,
        title: "Przelot do Krabi",
        description:
          "Zmiana scenerii: wapienne klify, dżungla i nowy dom na kolejne pięć dni.",
        tags: ["relaks"],
      },
      {
        day: 7,
        title: "Wyspy Phi Phi",
        description:
          "Rejs long-tail boatem, snorkeling i laguny, o których marzyłaś oglądając zdjęcia.",
        tags: ["wycieczka"],
      },
      {
        day: 8,
        title: "Wysoka wrażliwość",
        description:
          "Warsztat o układzie nerwowym, przebodźcowaniu i czułości wobec siebie.",
        tags: ["warsztat"],
      },
      {
        day: 9,
        title: "Ruch i woda",
        description:
          "Trening funkcjonalny nad zatoką, popołudnie w gorących źródłach, masaż tajski.",
        tags: ["fitness", "relaks"],
      },
      {
        day: 10,
        title: "Dzień dla siebie",
        description:
          "Bez agendy. Możesz spać, czytać, płynąć albo nie robić absolutnie nic.",
        tags: ["relaks"],
      },
      {
        day: 11,
        title: "Witaj, Bali",
        description:
          "Przelot na Bali, zakwaterowanie wśród tarasów ryżowych, kolacja powitalna.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 12,
        title: "Bliskość i granice",
        description:
          "Przedostatni warsztat — o relacjach, komunikowaniu potrzeb i mówieniu „nie”.",
        tags: ["warsztat"],
      },
      {
        day: 13,
        title: "Ubud i tarasy ryżowe",
        description:
          "Wycieczka do Ubud, świątynia nad wodą, warsztat lokalnej kuchni.",
        tags: ["wycieczka", "kultura"],
      },
      {
        day: 14,
        title: "Domknięcie",
        description:
          "Warsztat zamknięcia, sesja zdjęciowa o zachodzie słońca i uroczysta kolacja.",
        tags: ["warsztat", "integracja"],
      },
      {
        day: 15,
        title: "Powrót",
        description:
          "Ostatnia wspólna joga, śniadanie bez pośpiechu i transfer na lotnisko.",
        tags: ["fitness", "relaks"],
      },
    ],
  },
  {
    slug: "zanzibar",
    title: "Zanzibar",
    tagline: "Ocean, przyprawy i powrót do siebie.",
    continent: "Afryka",
    country: "Tanzania",
    durationDays: 8,
    startDate: "2027-02-07",
    endDate: "2027-02-14",
    price: 9900,
    deposit: 1500,
    capacity: 10,
    booked: 2,
    status: "open",
    coverImage:
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1600&auto=format&fit=crop",
    destinations: [
      {
        name: "Nungwi",
        dayRange: "Dni 1–4",
        description: "Turkusowa woda, rajskie plaże i warsztaty u progu oceanu.",
        image:
          "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Stone Town",
        dayRange: "Dni 5–8",
        description: "Wyspa przypraw, historia i domknięcie podróży.",
        image:
          "https://images.unsplash.com/photo-1568736333610-eae6e0ab9206?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    included: [
      "Warsztaty psychologiczne i seksuologiczne",
      "Noclegi przy plaży",
      "Codzienne zajęcia fitness / joga",
      "Gift bag powitalny",
      "Lokalne wycieczki",
      "Opieka organizatorek",
    ],
    itinerary: [
      {
        day: 1,
        title: "Powitanie w Nungwi",
        description:
          "Transfer, zakwaterowanie tuż przy plaży i wieczór zapoznawczy przy ognisku.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 2,
        title: "Warsztat otwarcia",
        description:
          "Pierwsza sesja warsztatowa nad oceanem — intencje, kontrakt, bezpieczna przestrzeń.",
        tags: ["warsztat"],
      },
      {
        day: 3,
        title: "Fitness & laguna",
        description:
          "Poranny trening na piasku, popołudnie na wodzie, zachód słońca z dhow.",
        tags: ["fitness", "relaks"],
      },
      {
        day: 4,
        title: "Kobieca energia i ciało",
        description:
          "Warsztat o cykliczności, akceptacji ciała i czułości wobec siebie.",
        tags: ["warsztat"],
      },
      {
        day: 5,
        title: "Wyspa przypraw",
        description:
          "Spice tour, lokalny lunch i przejazd do Stone Town — zupełnie inny Zanzibar.",
        tags: ["wycieczka", "kultura"],
      },
      {
        day: 6,
        title: "Wypalenie i odpoczynek",
        description:
          "Warsztat o regeneracji układu nerwowego — i praktyka odpoczynku w wersji dosłownej.",
        tags: ["warsztat", "relaks"],
      },
      {
        day: 7,
        title: "Domknięcie",
        description:
          "Sesja zamknięcia, sesja zdjęciowa w uliczkach Stone Town, uroczysta kolacja.",
        tags: ["warsztat", "integracja"],
      },
      {
        day: 8,
        title: "Powrót",
        description: "Poranna joga, śniadanie bez pośpiechu i transfer na lotnisko.",
        tags: ["fitness", "relaks"],
      },
    ],
  },
  {
    slug: "portugalia",
    title: "Portugalia",
    tagline: "Atlantyk, światło i czas dla siebie.",
    continent: "Europa",
    country: "Portugalia",
    durationDays: 6,
    startDate: "2026-09-12",
    endDate: "2026-09-17",
    price: 6900,
    deposit: 1200,
    capacity: 10,
    booked: 10,
    status: "soldout",
    coverImage:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1600&auto=format&fit=crop",
    destinations: [
      {
        name: "Lizbona",
        dayRange: "Dni 1–3",
        description: "Kolorowe uliczki, światło i pierwsze warsztaty.",
        image:
          "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Algarve",
        dayRange: "Dni 4–6",
        description: "Klify nad Atlantykiem i domknięcie podróży.",
        image:
          "https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    included: [
      "Warsztaty psychologiczne i seksuologiczne",
      "Noclegi w butikowych miejscach",
      "Zajęcia fitness / joga",
      "Gift bag powitalny",
      "Lokalne wycieczki",
      "Opieka organizatorek",
    ],
    itinerary: [
      {
        day: 1,
        title: "Powitanie w Lizbonie",
        description:
          "Transfer, zakwaterowanie w butikowym hotelu i kolacja powitalna z widokiem na Tag.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 2,
        title: "Warsztat otwarcia",
        description:
          "Pierwsza sesja warsztatowa, a po niej spacer po Alfamie i wieczór z fado.",
        tags: ["warsztat", "kultura"],
      },
      {
        day: 3,
        title: "Sintra i ocean",
        description:
          "Wycieczka do Sintry, pałace jak z bajki i pierwszy kontakt z Atlantykiem.",
        tags: ["wycieczka"],
      },
      {
        day: 4,
        title: "Przejazd na Algarve",
        description:
          "Klify, groty i nowy dom na ostatnie dni. Popołudniowa joga nad oceanem.",
        tags: ["fitness", "relaks"],
      },
      {
        day: 5,
        title: "Neuroróżnorodność w codzienności",
        description:
          "Warsztat o organizowaniu życia, odpoczynku i bliskości w zgodzie ze sobą.",
        tags: ["warsztat"],
      },
      {
        day: 6,
        title: "Domknięcie i powrót",
        description:
          "Krąg zamknięcia o wschodzie słońca, śniadanie bez pośpiechu i transfer na lotnisko.",
        tags: ["warsztat", "integracja"],
      },
    ],
  },
];

export const continents: Continent[] = ["Azja", "Afryka", "Europa"];

/** Pomocnicze — statyczne źródło (fallback dla API, patrz `src/lib/api`). */
export function getTrips(): Trip[] {
  return trips;
}

export function getTripBySlug(slug: string): Trip | undefined {
  return trips.find((t) => t.slug === slug);
}

export function spotsLeft(trip: Trip): number {
  return Math.max(0, trip.capacity - trip.booked);
}

export function isSoldOut(trip: Trip): boolean {
  return trip.status === "soldout" || spotsLeft(trip) === 0;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const fmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}
