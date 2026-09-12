// Generuje seed SQL z tych samych danych, które ma frontend — dzięki temu
// lokalna baza i statyczny fallback nie rozjeżdżają się ze sobą.
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const source = readFileSync("src/lib/data/trips.ts", "utf8");
const start = source.indexOf("export const trips: Trip[] = [");
// Uwaga: pierwszy "[" po "export const" to ten z adnotacji `Trip[]`.
const arrayStart = source.indexOf("= [", start) + 2;
// Znajdź domykający nawias tablicy przez zliczanie.
let depth = 0, end = -1, inStr = null;
for (let i = arrayStart; i < source.length; i++) {
  const ch = source[i];
  if (inStr) { if (ch === "\\") i++; else if (ch === inStr) inStr = null; continue; }
  if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
  if (ch === "[") depth++;
  else if (ch === "]") { depth--; if (depth === 0) { end = i; break; } }
}
const literal = source.slice(arrayStart, end + 1);
const trips = eval(`(${literal})`);

const continentMap = { "Azja": "ASIA", "Afryka": "AFRICA", "Europa": "EUROPE" };
const q = (v) => v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`;
const NOW = "current_timestamp";

const lines = [
  "-- Dane startowe wyjazdów (środowisko lokalne / demo).",
  "-- Plik generowany z src/lib/data/trips.ts — patrz api/README.md.",
  "",
];

for (const trip of trips) {
  const tripId = randomUUID();
  lines.push(`-- ${trip.title}`);
  lines.push(`insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,`);
  lines.push(`                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,`);
  lines.push(`                   published, cover_image)`);
  lines.push(`values (${q(tripId)}, ${NOW}, ${NOW}, 0, ${q(trip.slug)}, ${q(trip.title)}, ${q(trip.tagline)},`);
  lines.push(`        ${q(continentMap[trip.continent])}, ${q(trip.country)}, ${trip.durationDays},`);
  lines.push(`        date ${q(trip.startDate)}, date ${q(trip.endDate)}, ${trip.price}, ${trip.deposit},`);
  lines.push(`        ${trip.capacity}, ${trip.booked}, true, ${q(trip.coverImage)});`);
  lines.push("");

  trip.included.forEach((item, index) => {
    lines.push(`insert into trip_included (trip_id, position_index, item) values (${q(tripId)}, ${index}, ${q(item)});`);
  });
  lines.push("");

  trip.destinations.forEach((destination, index) => {
    lines.push(`insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)`);
    lines.push(`values (${q(randomUUID())}, ${NOW}, ${NOW}, 0, ${q(tripId)}, ${index}, ${q(destination.name)}, ${q(destination.dayRange)}, ${q(destination.description)}, ${q(destination.image)});`);
  });
  lines.push("");

  for (const day of trip.itinerary) {
    const dayId = randomUUID();
    lines.push(`insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)`);
    lines.push(`values (${q(dayId)}, ${NOW}, ${NOW}, 0, ${q(tripId)}, ${day.day}, ${q(day.title)}, ${q(day.description)});`);
    (day.tags ?? []).forEach((tag, index) => {
      lines.push(`insert into trip_day_tags (trip_day_id, position_index, tag) values (${q(dayId)}, ${index}, ${q(tag)});`);
    });
  }
  lines.push("");
}

writeFileSync("api/src/main/resources/db/seed/V1000__seed_trips.sql", lines.join("\n") + "\n");
console.log("wygenerowano", trips.length, "wyjazdów");
