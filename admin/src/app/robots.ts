import type { MetadataRoute } from "next";

/**
 * Panel administracyjny nie ma nic do szukania w wyszukiwarkach.
 *
 * Sam `noindex` w metadanych też tu jest, ale działa dopiero po pobraniu
 * strony. Blokada w robots.txt zatrzymuje roboty wcześniej — przy panelu,
 * którego nigdy nie chcemy w wynikach, nie ma to żadnego minusa.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
