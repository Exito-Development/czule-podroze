/**
 * Wspólna warstwa SEO — jedno miejsce, z którego biorą się adresy absolutne.
 *
 * Canonical, og:url, sitemapa i dane strukturalne muszą wskazywać na tę samą,
 * pełną domenę. Trzymanie jej w jednym module zamiast wklejania po plikach
 * sprawia, że zmiana domeny (albo postawienie środowiska testowego) to jedna
 * zmienna, a nie polowanie po repozytorium.
 */

/** Adres produkcyjny. Środowisko testowe nadpisuje go zmienną. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://czulapodroz.pl"
).replace(/\/$/, "");

/** Ścieżka → adres absolutny. Google wymaga pełnych URL-i w danych strukturalnych. */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Opis, którym posługuje się strona główna i podgląd linku w mediach
 * społecznościowych. Około 155 znaków — tyle Google pokazuje w wyniku.
 */
export const defaultDescription =
  "Kameralne wyjazdy psychologiczno-seksuologiczne dla kobiet — warsztaty " +
  "z psycholożkami, joga i czas dla siebie. Grupy do 10 osób, Tajlandia, " +
  "Zanzibar, Portugalia.";

/** Frazy, pod które realnie chcemy być znajdowane. */
export const defaultKeywords = [
  "wyjazdy psychologiczne",
  "wyjazdy seksuologiczne",
  "wyjazdy dla kobiet",
  "warsztaty rozwojowe za granicą",
  "retreat dla kobiet",
  "wyjazd z warsztatami",
  "podróże kobiece",
  "Czuła Podróż",
];
