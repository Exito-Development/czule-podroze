import { apiRequest } from "@/lib/api/client";
import type { TripDto } from "@/lib/api/types";
import {
  getTrips as staticTrips,
  type Continent,
  type Trip,
  type TripStatus,
} from "@/lib/data/trips";

/** Jak długo (w sekundach) trzymamy odpowiedź katalogu w cache Next.js. */
const CATALOG_REVALIDATE_SECONDS = 60;

const knownStatuses: TripStatus[] = ["open", "few-left", "soldout", "upcoming"];
const knownContinents: Continent[] = ["Azja", "Afryka", "Europa"];

/**
 * Zamienia DTO z API na model używany w komponentach.
 *
 * Nieznany kontynent albo status (np. dodany w API po wdrożeniu frontendu)
 * nie wywraca strony — wpada w bezpieczną wartość domyślną.
 */
export function toTrip(dto: TripDto): Trip {
  return {
    slug: dto.slug,
    title: dto.title,
    tagline: dto.tagline,
    continent: knownContinents.includes(dto.continent as Continent)
      ? (dto.continent as Continent)
      : "Europa",
    country: dto.country,
    durationDays: dto.durationDays,
    startDate: dto.startDate,
    endDate: dto.endDate,
    price: dto.price,
    deposit: dto.deposit,
    capacity: dto.capacity,
    booked: dto.booked,
    status: knownStatuses.includes(dto.status as TripStatus)
      ? (dto.status as TripStatus)
      : "open",
    coverImage: dto.coverImage,
    destinations: dto.destinations,
    included: dto.included,
    itinerary: dto.itinerary,
  };
}

/**
 * Katalog wyjazdów: najpierw API, a gdy backend nie odpowiada — dane statyczne.
 *
 * Dzięki temu strona ofertowa działa nawet przy chwilowej awarii backendu.
 * Pola, które wymagają żywego API (koszyk, rezerwacja) i tak same zgłoszą
 * problem, więc nikt nie kupi miejsca na podstawie nieaktualnych danych.
 */
export async function fetchTrips(): Promise<Trip[]> {
  try {
    const trips = await apiRequest<TripDto[]>("/api/v1/trips", {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["trips"] },
    });
    return trips.map(toTrip);
  } catch {
    return staticTrips();
  }
}

export async function fetchTrip(slug: string): Promise<Trip | undefined> {
  try {
    const trip = await apiRequest<TripDto>(`/api/v1/trips/${slug}`, {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["trips", `trip:${slug}`] },
    });
    return toTrip(trip);
  } catch {
    return staticTrips().find((trip) => trip.slug === slug);
  }
}
