import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTrips,
  getTripBySlug,
  formatDateRange,
} from "@/lib/data/trips";
import BookingBox from "@/components/shop/BookingBox";
import FooterReveal from "@/components/layout/FooterReveal";

export function generateStaticParams() {
  return getTrips().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  return { title: trip ? trip.title : "Wyjazd" };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  return (
    <main>
      {/* Hero wyjazdu */}
      <section className="relative z-10 h-[60vh] min-h-[420px] w-full overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/10" />
        <div className="section-pad absolute bottom-12 left-0 z-10 text-ivory">
          <p className="text-sm uppercase tracking-[0.3em] text-ivory/80">
            {trip.continent} · {trip.durationDays} dni
          </p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl">{trip.title}</h1>
          <p className="mt-2 text-lg text-ivory/90">{trip.tagline}</p>
        </div>
      </section>

      <section className="section-pad relative z-10 bg-ivory py-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm text-ink-soft">
              {formatDateRange(trip.startDate, trip.endDate)} · {trip.country}
            </p>

            <h2 className="mt-8 font-serif text-3xl">Destynacje</h2>
            <div className="mt-6 space-y-6">
              {trip.destinations.map((d) => (
                <div key={d.name} className="flex gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image}
                    alt={d.name}
                    className="h-28 w-28 flex-shrink-0 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sage-dark">
                      {d.dayRange}
                    </p>
                    <h3 className="font-serif text-xl">{d.name}</h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      {d.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-12 font-serif text-3xl">W cenie</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {trip.included.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-soft">
                  <span className="text-sage-dark">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Box rezerwacji (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <BookingBox trip={trip} />
            </div>
          </div>
        </div>
      </section>

      <FooterReveal />
    </main>
  );
}
