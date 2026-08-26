/**
 * Warstwa danych — tymczasowo statyczna.
 *
 * Docelowo te dane będzie serwował backend (Spring Boot) przez REST/GraphQL.
 * Kształt typów jest celowo "API-friendly", więc podmiana źródła
 * (np. `getTrips()` -> fetch z backendu) nie wymusi zmian w komponentach.
 */

export type Continent = "Azja" | "Afryka" | "Europa" | "Ameryka";

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
          "Transfer, zakwaterowanie, wieczór zapoznawczy i rozdanie gift bagów.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 2,
        title: "Warsztat otwarcia",
        description:
          "Pierwsza sesja warsztatowa: bezpieczna przestrzeń, intencje na podróż.",
        tags: ["warsztat"],
      },
      {
        day: 3,
        title: "Poranna joga & plaża",
        description: "Fitness o wschodzie słońca, dzień regeneracji nad wodą.",
        tags: ["fitness", "relaks"],
      },
      {
        day: 4,
        title: "Bliżej siebie",
        description:
          "Warsztat z obszaru psychoseksuologii — praca z ciałem i granicami.",
        tags: ["warsztat"],
      },
      {
        day: 5,
        title: "Lokalna kultura",
        description: "Wycieczka po wyspie, lokalna kuchnia, targ i świątynie.",
        tags: ["wycieczka", "kultura"],
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
        description: "Transfer, zakwaterowanie i wieczór zapoznawczy.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 2,
        title: "Warsztat otwarcia",
        description: "Pierwsza sesja warsztatowa nad oceanem.",
        tags: ["warsztat"],
      },
      {
        day: 3,
        title: "Fitness & laguna",
        description: "Poranny trening, popołudnie na wodzie.",
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
        description: "Transfer, zakwaterowanie i kolacja powitalna.",
        tags: ["relaks", "integracja"],
      },
      {
        day: 2,
        title: "Warsztat otwarcia",
        description: "Pierwsza sesja warsztatowa.",
        tags: ["warsztat"],
      },
    ],
  },
];

export const continents: Continent[] = ["Azja", "Afryka", "Europa", "Ameryka"];

/** Pomocnicze — docelowo do podmiany na fetch z backendu. */
export function getTrips(): Trip[] {
  return trips;
}

export function getTripBySlug(slug: string): Trip | undefined {
  return trips.find((t) => t.slug === slug);
}

export function spotsLeft(trip: Trip): number {
  return Math.max(0, trip.capacity - trip.booked);
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
