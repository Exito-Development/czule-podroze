export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Dla kogo są te wyjazdy?",
    answer:
      "Dla kobiet w każdym wieku, które chcą połączyć podróż z pracą nad sobą — niezależnie od tego, czy przyjeżdżasz sama, czy z koleżanką. Grupy są kameralne, więc szybko poznajemy się nawzajem.",
  },
  {
    question: "Jak wygląda rezerwacja i płatność?",
    answer:
      "Miejsce rezerwujesz, wpłacając zadatek. Pozostałą kwotę dopłacasz w terminie podanym przy wyjeździe. Płatność odbywa się bezpiecznie przez naszego operatora płatności.",
  },
  {
    question: "Czy mogę zapłacić całość od razu?",
    answer:
      "Tak — przy rezerwacji wybierasz, czy wpłacasz tylko zadatek, czy od razu pełną kwotę.",
  },
  {
    question: "Co, jeśli wszystkie miejsca są zajęte?",
    answer:
      "Możesz zapisać się na listę rezerwową. Damy Ci znać, gdy zwolni się miejsce lub gdy ruszy kolejna edycja wyjazdu.",
  },
  {
    question: "Kto prowadzi warsztaty?",
    answer:
      "Warsztaty prowadzą Wiktoria i Natalia — psycholożki i organizatorki wyjazdów. Cała agenda jest autorska i dopasowana do grupy.",
  },
  {
    question: "Co jest wliczone w cenę?",
    answer:
      "Warsztaty, noclegi, codzienne zajęcia fitness/joga, lokalne wycieczki z agendy, gift bag powitalny oraz opieka organizatorek. Szczegóły znajdziesz na stronie każdego wyjazdu.",
  },
];
