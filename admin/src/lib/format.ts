/** Formatowanie liczb i dat — jeden zestaw reguł dla całego panelu. */

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatPrice(value: number | null | undefined): string {
  return priceFormatter.format(value ?? 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dateTimeFormatter.format(new Date(value));
}

export function formatDateRange(start: string, end: string): string {
  return `${dateFormatter.format(new Date(start))} – ${dateFormatter.format(new Date(end))}`;
}

/** Odmiana rzeczownika przez liczbę — „1 miejsce", „2 miejsca", „5 miejsc". */
export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function seats(count: number): string {
  return `${count} ${plural(count, "miejsce", "miejsca", "miejsc")}`;
}

export function people(count: number): string {
  return `${count} ${plural(count, "osoba", "osoby", "osób")}`;
}

/** Forma po przyimku „do": „do 1 osoby", „do 3 osób". */
export function peopleGenitive(count: number): string {
  return `${count} ${count === 1 ? "osoby" : "osób"}`;
}

/** Data w formacie `yyyy-MM-dd` dla pól formularza. */
export function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}
