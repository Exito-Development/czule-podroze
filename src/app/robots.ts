import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Reguły dla robotów.
 *
 * Blokujemy wyłącznie ścieżki transakcyjne: koszyk, zamówienie i podgląd
 * cudzej rezerwacji nie mają czego szukać w wynikach wyszukiwania, a adres
 * rezerwacji zawiera numer zamówienia konkretnej osoby.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/zamowienie", "/rezerwacja", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
