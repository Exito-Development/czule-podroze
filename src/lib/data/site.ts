/** Globalna konfiguracja marki i treści współdzielonych. */

export const site = {
  name: "Czuła Podróż",
  tagline: "Wyjazdy psychologiczno-seksuologiczne",
  email: "kontakt@czulapodroz.pl",
  phone: "+48 000 000 000",
  instagram: "https://instagram.com/czulapodroz",
  facebook: "https://facebook.com/czulapodroz",
};

export const nav = [
  { label: "Nasze wyjazdy", href: "/#destynacje" },
  { label: "Warsztaty", href: "/warsztaty" },
  { label: "O nas", href: "/#o-nas" },
  { label: "Dlaczego warto", href: "/#dlaczego-warto" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/#kontakt" },
];

export interface Reason {
  title: string;
  description: string;
  icon: string;
}

export const reasons: Reason[] = [
  {
    title: "Warsztaty prowadzone przez psycholożki",
    description:
      "Każdy wyjazd ma autorską agendę warsztatów psychologicznych i seksuologicznych — wiedza, którą zabierasz ze sobą na zawsze.",
    icon: "sparkle",
  },
  {
    title: "Bliższe poznanie siebie",
    description:
      "Bezpieczna przestrzeń do pracy z ciałem, emocjami i granicami. Wracasz bliżej siebie niż kiedykolwiek.",
    icon: "heart",
  },
  {
    title: "Kameralna grupa, maks. 10 osób",
    description:
      "Małe grono oznacza prawdziwe relacje, uważność i komfort. Tu nikt nie jest anonimowy.",
    icon: "users",
  },
  {
    title: "Odkrywanie lokalnej kultury",
    description:
      "Nie tylko warsztaty — lokalne smaki, miejsca i ludzie, których nie znajdziesz w przewodniku.",
    icon: "compass",
  },
  {
    title: "Wspomnienia na zawsze",
    description:
      "Profesjonalne zdjęcia i przeżycia, które zostają z Tobą długo po powrocie do domu.",
    icon: "camera",
  },
];

/** Hasła przewijającego się paska pod hero (treść do doprecyzowania przez klientki). */
export interface MarqueeItem {
  label: string;
  icon: string;
}

export const marqueeItems: MarqueeItem[] = [
  { label: "Kameralne grupy do 10 osób", icon: "users" },
  { label: "Warsztaty z psycholożkami", icon: "sparkle" },
  { label: "Joga i fitness o świcie", icon: "sun" },
  { label: "Gift bag powitalny", icon: "heart" },
  { label: "Zdjęcia na całe życie", icon: "camera" },
  { label: "Lokalne smaki i kultura", icon: "compass" },
  { label: "Czas tylko dla siebie", icon: "palm" },
  { label: "Bezpieczna przestrzeń", icon: "heart" },
  { label: "Opieka organizatorek 24/7", icon: "users" },
  { label: "3 destynacje, 1 podróż", icon: "plane" },
];

/** Rodzaje warsztatów prezentowane w zakładkach (sekcja inspirowana CoParadiso). */
export interface Workshop {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
}

export const workshops: Workshop[] = [
  {
    id: "wewnetrzne-dziecko",
    title: "Obudź w sobie wewnętrzne dziecko",
    tagline: "Lekkość, ciekawość, zabawa",
    description:
      "Warsztat o powrocie do spontaniczności i radości. Przez ruch, zabawę i pracę z ciałem odzyskujesz kontakt z tą częścią siebie, która potrafi się cieszyć bez powodu.",
    image:
      "https://images.unsplash.com/photo-1527526029430-319f10814151?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "wysoka-wrazliwosc",
    title: "Wysoka wrażliwość",
    tagline: "Twoja siła, nie słabość",
    description:
      "Dla osób, które czują więcej i głębiej. Uczymy się rozumieć swój układ nerwowy, stawiać granice i traktować wrażliwość jako zasób — także w relacjach i intymności.",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "neuroroznorodnosc",
    title: "Neuroróżnorodność w codzienności",
    tagline: "Twój mózg, twoje zasady",
    description:
      "Praktyczne narzędzia dla neuroatypowych umysłów — ADHD, spektrum, wysoka wrażliwość. Jak organizować życie, odpoczynek i bliskość w zgodzie ze sobą, a nie wbrew sobie.",
    image:
      "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "bliskosc-i-granice",
    title: "Bliskość i granice",
    tagline: "Tak znaczy tak, nie znaczy nie",
    description:
      "Warsztat o budowaniu zdrowej intymności — jak rozpoznawać i komunikować swoje potrzeby, mówić „nie” bez poczucia winy i tworzyć relacje, w których czujesz się bezpiecznie.",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "wypalenie",
    title: "Wypalenie i odpoczynek",
    tagline: "Zatrzymaj się, zanim staniesz",
    description:
      "Dla tych, które dają z siebie wszystko — aż do dna. Uczymy się rozpoznawać sygnały wypalenia, regenerować układ nerwowy i odpoczywać tak, by naprawdę nabrać sił.",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "kobieca-energia",
    title: "Kobieca energia i ciało",
    tagline: "Wróć do siebie, do ciała",
    description:
      "Praca z ciałem, oddechem i cyklicznością. Warsztat o czułości wobec siebie, akceptacji ciała i czerpaniu z naturalnej, kobiecej energii — bez wstydu i oceniania.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1400&auto=format&fit=crop",
  },
];

export interface Host {
  name: string;
  role: string;
  bullets: string[];
  instagram: string;
  image: string;
}

export const hosts: Host[] = [
  {
    name: "Wiktoria",
    role: "Psycholożka & koordynatorka",
    bullets: [
      "Poszukiwaczka pięknych miejsc",
      "Uwielbia aktywny wypoczynek",
      "Planerka i dusza organizacji",
      "Najlepsza towarzyszka podróży",
    ],
    instagram: "@wiktoria.ontrip",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Natalia",
    role: "Psycholożka & seksuolożka",
    bullets: [
      "Zawsze z aparatem w ręku",
      "Miłośniczka plaż i dobrego jedzenia",
      "Organizatorka dusza wyjazdu",
      "Wierzy, że życie to przygoda",
    ],
    instagram: "@natalka.travel",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=900&auto=format&fit=crop",
  },
];
