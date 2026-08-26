"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getTrips,
  spotsLeft,
  formatPrice,
  formatDateRange,
  continents,
  type Continent,
  type Trip,
} from "@/lib/data/trips";
import { useCart } from "@/components/providers/CartContext";
import { openWaitlist } from "@/components/shop/WaitlistModal";
import { Icon } from "@/components/ui/Icon";
import MixedTitle from "@/components/ui/MixedTitle";
import TiltCard from "@/components/anim/TiltCard";
import { clsx } from "@/lib/clsx";

const allTrips = getTrips();
const filters: ("Wszystkie" | Continent)[] = ["Wszystkie", ...continents];

const statusLabel: Record<Trip["status"], { text: string; cls: string }> = {
  open: { text: "Wolne miejsca", cls: "bg-sage/15 text-sage-dark" },
  "few-left": { text: "Ostatnie miejsca", cls: "bg-blush/30 text-ink" },
  soldout: { text: "Brak miejsc", cls: "bg-ink/10 text-ink-soft" },
  upcoming: { text: "Wkrótce", cls: "bg-ecru text-ink-soft" },
};

export default function Destinations() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Wszystkie");
  const { addTrip } = useCart();

  const visible =
    filter === "Wszystkie"
      ? allTrips
      : allTrips.filter((t) => t.continent === filter);

  return (
    <section id="destynacje" className="section-pad section-y bg-cream">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
              Nasze destynacje
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl">
              <MixedTitle text="Nasze *wyjazdy" />
            </h2>
          </div>

          {/* Kategorie wyjazdów */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  filter === f
                    ? "bg-sage text-ivory"
                    : "bg-ivory text-ink-soft hover:bg-sand"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((trip) => {
            const left = spotsLeft(trip);
            const badge = statusLabel[trip.status];
            const soldout = trip.status === "soldout" || left === 0;

            return (
              <TiltCard key={trip.slug} className="h-full">
              <article
                className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-ivory shadow-md shadow-ink/10 ring-1 ring-ink/5 transition-shadow hover:shadow-xl hover:shadow-ink/15"
              >
                <Link
                  href={`/wyjazdy/${trip.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className={clsx(
                      "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur",
                      badge.cls
                    )}
                  >
                    {badge.text}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-sage-dark">
                    {trip.continent} · {trip.durationDays} dni
                  </p>
                  <h3 className="mt-2 font-serif text-2xl">{trip.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{trip.tagline}</p>

                  <p className="mt-3 text-sm text-ink-soft">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>

                  <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-ink-soft">od</p>
                        <p className="font-serif text-xl">
                          {formatPrice(trip.price)}
                        </p>
                      </div>
                      {!soldout && (
                        <p className="text-xs text-ink-soft">
                          {left} {left === 1 ? "miejsce" : "miejsc"}
                        </p>
                      )}
                    </div>

                    {soldout ? (
                      <button
                        onClick={() => openWaitlist(trip.title)}
                        className="mt-4 w-full rounded-full border border-ink/20 py-3 text-sm transition-colors hover:bg-ink/5"
                      >
                        Lista rezerwowa
                      </button>
                    ) : (
                      <button
                        onClick={() => addTrip(trip)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage py-3 text-sm text-ivory transition-colors hover:bg-sage-dark"
                      >
                        Chcę jechać!
                        <Icon name="dolphin" className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
