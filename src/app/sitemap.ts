import type { MetadataRoute } from "next";
import { fetchTrips } from "@/lib/api/trips";
import { absoluteUrl } from "@/lib/seo";

/**
 * Mapa strony. Wyjazdy pobieramy z API, więc nowa oferta dodana w panelu
 * pojawia się w sitemapie sama — bez zmiany w kodzie.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const statyczne: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/warsztaty"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/regulamin"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/polityka-prywatnosci"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Gdy API nie odpowiada, mapa strony i tak musi się zbudować — lepiej oddać
  // same strony statyczne niż wywalić build całej witryny.
  let wyjazdy: MetadataRoute.Sitemap = [];
  try {
    wyjazdy = (await fetchTrips()).map((trip) => ({
      url: absoluteUrl(`/wyjazdy/${trip.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    wyjazdy = [];
  }

  return [...statyczne, ...wyjazdy];
}
