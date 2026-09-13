import { ImageResponse } from "next/og";
import { fetchTrip } from "@/lib/api/trips";
import { formatDateRange } from "@/lib/data/trips";
import { site } from "@/lib/data/site";

/** Podgląd linku do konkretnego wyjazdu — z jego zdjęciem, nazwą i terminem. */
export const alt = "Wyjazd — Czuła Podróż";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Zdjęcie wczytujemy sami, zamiast zostawiać to generatorowi obrazków.
 *
 * Powód jest praktyczny: generator nie obsługuje WebP/AVIF (a Unsplash z
 * `auto=format` oddaje właśnie WebP) i nie potrafi zgadnąć wymiarów, a każde
 * potknięcie po jego stronie kończy całą trasę błędem zamiast obrazkiem.
 * Pobranie z własnym limitem czasu pozwala po prostu zrezygnować ze zdjęcia
 * i oddać wariant na samym tle — podgląd linku działa dalej.
 */
async function pobierzTlo(url: string): Promise<string | null> {
  let adres: URL;
  try {
    adres = new URL(url);
  } catch {
    return null;
  }
  if (adres.hostname.endsWith("images.unsplash.com")) {
    adres.searchParams.delete("auto");
    adres.searchParams.set("fm", "jpg");
    adres.searchParams.set("w", String(size.width));
    adres.searchParams.set("h", String(size.height));
    adres.searchParams.set("fit", "crop");
  }

  try {
    const odpowiedz = await fetch(adres, { signal: AbortSignal.timeout(4000) });
    if (!odpowiedz.ok) return null;
    const typ = odpowiedz.headers.get("content-type") ?? "";
    if (!/^image\/(jpeg|png)$/.test(typ)) return null;
    const dane = Buffer.from(await odpowiedz.arrayBuffer()).toString("base64");
    return `data:${typ};base64,${dane}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await fetchTrip(slug);
  const tlo = trip?.coverImage ? await pobierzTlo(trip.coverImage) : null;

  // Generator wymaga jawnego `display: flex` na każdym elemencie, który ma
  // więcej niż jedno dziecko — dlatego wiersz z terminem składamy w jeden ciąg.
  const termin = trip
    ? `${formatDateRange(trip.startDate, trip.endDate)} · ${trip.durationDays} dni · ${trip.country}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "linear-gradient(135deg, #3a342c 0%, #6b6356 100%)",
          color: "#faf6ef",
          position: "relative",
        }}
      >
        {tlo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tlo}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size.width,
              height: size.height,
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            {site.name}
          </div>
          <div
            style={{ display: "flex", fontSize: 92, marginTop: 16, lineHeight: 1.05 }}
          >
            {trip?.title ?? "Wyjazd"}
          </div>
          {termin ? (
            <div
              style={{ display: "flex", fontSize: 34, marginTop: 18, opacity: 0.9 }}
            >
              {termin}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
