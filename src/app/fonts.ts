import {
  Fraunces,
  Dancing_Script,
  Inter,
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

/** Tekst podstawowy. */
export const inter = Inter({
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
