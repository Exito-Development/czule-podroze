import type { TripDay } from "@/lib/data/trips";

/**
 * Skraca plan wyjazdu do `count` reprezentatywnych dni na potrzeby podglądu
 * (mini-oś czasu na kafelku). Zawsze zachowuje pierwszy i ostatni dzień,
 * pozostałe wybiera równomiernie, żeby podgląd oddawał rytm całej podróży.
 */
export function condenseItinerary(days: TripDay[], count = 4): TripDay[] {
  if (days.length <= count) return days;
  if (count <= 1) return days.slice(0, 1);

  const step = (days.length - 1) / (count - 1);
  const picked = new Map<number, TripDay>();
  for (let i = 0; i < count; i += 1) {
    const index = Math.round(i * step);
    picked.set(index, days[index]);
  }
  return [...picked.values()];
}

/** Etykieta typu „Dzień 1 z 15" pod kropką osi czasu. */
export function dayLabel(day: number, total: number): string {
  return `Dzień ${day} z ${total}`;
}
