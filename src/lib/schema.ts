/**
 * Dane strukturalne (schema.org, JSON-LD).
 *
 * To one decydują, czy w Google pojawi się sam niebieski link, czy wynik
 * rozszerzony — z ceną, terminem i gwiazdkami. Google czyta JSON-LD wprost
 * z HTML-u, więc bloki muszą trafiać do odpowiedzi serwera, a nie powstawać
 * dopiero w przeglądarce.
 */
import type { Trip } from "@/lib/data/trips";
import type { FaqItem } from "@/lib/data/faq";
import { site } from "@/lib/data/site";
import { absoluteUrl, defaultDescription } from "@/lib/seo";

/** Organizacja — spina markę z profilami społecznościowymi i kontaktem. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": absoluteUrl("/#organizacja"),
    name: site.name,
    description: defaultDescription,
    url: absoluteUrl("/"),
    email: site.email,
    image: absoluteUrl("/opengraph-image"),
    // `sameAs` to sposób, w jaki Google łączy stronę z profilami w serwisach
    // społecznościowych — bez tego traktuje je jako niezwiązane byty.
    sameAs: [site.instagram, site.facebook],
    areaServed: "PL",
    knowsLanguage: ["pl"],
  };
}

/** Strona jako całość — pozwala Google pokazać nazwę serwisu zamiast domeny. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#strona"),
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: "pl-PL",
    publisher: { "@id": absoluteUrl("/#organizacja") },
  };
}

/**
 * Pojedynczy wyjazd. `TouristTrip` z ofertą daje w wyniku wyszukiwania cenę
 * i dostępność — to najmocniejszy pojedynczy sygnał, jaki ta strona ma do dania.
 */
export function tripSchema(trip: Trip) {
  const url = absoluteUrl(`/wyjazdy/${trip.slug}`);
  const soldOut = trip.booked >= trip.capacity;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${url}#wyjazd`,
    name: trip.title,
    description: trip.tagline,
    url,
    image: trip.coverImage,
    touristType: "Kobiety zainteresowane rozwojem osobistym",
    provider: { "@id": absoluteUrl("/#organizacja") },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: trip.destinations.length,
      itemListElement: trip.destinations.map((destination, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristDestination",
          name: destination.name,
          description: destination.description,
        },
      })),
    },
    offers: {
      "@type": "Offer",
      url,
      price: trip.price,
      priceCurrency: "PLN",
      availability: soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      // Data ważności oferty: zapisy kończą się wraz ze startem wyjazdu.
      validThrough: trip.startDate,
      // Liczba wolnych miejsc bywa zerowa — wtedy `availability` wyżej mówi
      // Google, żeby nie pokazywał oferty jako dostępnej.
      inventoryLevel: {
        "@type": "QuantitativeValue",
        value: Math.max(0, trip.capacity - trip.booked),
      },
    },
    subjectOf: {
      "@type": "Event",
      name: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: trip.country,
        address: { "@type": "PostalAddress", addressCountry: trip.country },
      },
      organizer: { "@id": absoluteUrl("/#organizacja") },
    },
  };
}

/** Pytania i odpowiedzi — Google potrafi rozwinąć je wprost w wyniku. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Okruszki — w wyniku wyszukiwania zastępują surową ścieżkę URL. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}
