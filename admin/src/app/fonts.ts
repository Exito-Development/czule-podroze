import { Fraunces, Inter } from "next/font/google";

/** Ten sam krój nagłówkowy co na stronie — panel ma wyglądać jak część marki. */
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});
