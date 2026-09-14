import type { Trip } from "@/lib/data/trips";
import { condenseItinerary } from "@/lib/itinerary";

/**
 * Mini-oś czasu wyjazdu rysowana na okładce kafelka.
 *
 * Pojawia się po wskazaniu kafelka (hover / focus wewnątrz `.group`):
 * linia „wyrasta" od góry, a kolejne kropki i podpisy wchodzą kaskadowo.
 * Całość na czystym CSS — bez JS, więc nie kosztuje nic przy przewijaniu
 * listy ofert i automatycznie zamiera przy `prefers-reduced-motion`.
 */
export default function TripSpine({
  trip,
  days = 4,
}: {
  trip: Trip;
  /** Ile dni pokazać w podglądzie. */
  days?: number;
}) {
  const preview = condenseItinerary(trip.itinerary, days);
  if (preview.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/55 to-ink/0 p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.22em] text-ivory/70">
        Plan podróży
      </p>

      <ol className="relative space-y-2.5 pl-5">
        {/* Linia czasu — „wyrasta" od góry po wskazaniu kafelka. */}
        <span className="absolute left-[3px] top-1.5 h-[calc(100%-0.75rem)] w-px origin-top scale-y-0 bg-ivory/45 transition-transform duration-700 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100" />

        {preview.map((day, i) => (
          <li
            key={day.day}
            className="relative translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
            style={{ transitionDelay: `${120 + i * 90}ms` }}
          >
            <span className="absolute -left-5 top-[0.3rem] h-[7px] w-[7px] rounded-full bg-blush ring-2 ring-ink/30" />
            <p className="text-xs leading-tight text-ivory">
              <span className="text-ivory/60">Dzień {day.day} · </span>
              {day.title}
            </p>
          </li>
        ))}
      </ol>

      {trip.itinerary.length > preview.length && (
        <p
          className="mt-3 translate-x-2 pl-5 text-[0.7rem] text-ivory/70 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
          style={{ transitionDelay: `${120 + preview.length * 90}ms` }}
        >
          …i jeszcze {trip.itinerary.length - preview.length} dni
        </p>
      )}
    </div>
  );
}
