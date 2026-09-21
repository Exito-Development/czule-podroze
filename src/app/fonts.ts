import {
  Fraunces,
  Dancing_Script,
  Figtree,
  Caprasimo,
} from "next/font/google";

/** Serif nagłówkowy — w klimacie kroju z Anthropic (Copernicus/Tiempos). */
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

/** Skryptowy akcent — odręczne hasła ("Przygoda życia"). */
export const dancing = Dancing_Script({
  subsets: ["latin", "latin-ext"],
  variable: "--font-script",
  display: "swap",
});

/**
 * Tekst podstawowy.
 *
 * Figtree zamiast Intera: Inter jest krojem interfejsowym — neutralnym z
 * założenia — i w dłuższych opisach brzmi bezosobowo obok ciepłego Fraunces
 * w nagłówkach. Figtree ma miększe, lekko humanistyczne kształty, które
 * trzymają ten sam ton, a przy tym pozostaje w pełni czytelny w akapicie.
 *
 * `latin-ext` jest tu obowiązkowe — bez niego ą, ę, ł, ń, ś, ź i ż podstawiają
 * się z zapasowego kroju systemowego i tekst zaczyna „skakać" w połowie wyrazu.
 */
export const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Display z charakterem — pulchny, retro krój w klimacie Cooper Black
 * (jak logo CoParadiso). Do pojedynczych słów w nagłówkach i akcentów.
 * Uwaga: "Yuyu" nie istnieje w Google Fonts — Caprasimo to najbliższy
 * "wow" odpowiednik pasujący do wakacyjnego brandu.
 */
export const caprasimo = Caprasimo({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});
