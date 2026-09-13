/**
 * Wstrzykuje blok danych strukturalnych do HTML-u.
 *
 * Komponent serwerowy — dane muszą być w odpowiedzi serwera, bo roboty
 * indeksujące czytają HTML, zanim wykona się jakikolwiek JavaScript.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Treść pochodzi wyłącznie z naszych danych (katalog, FAQ), nie od
      // użytkowników. `<` uciekamy mimo to, żeby żaden tytuł wyjazdu nie mógł
      // przedwcześnie zamknąć znacznika <script>.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
