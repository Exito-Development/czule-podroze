"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  spotsLeft,
  isSoldOut,
  formatPrice,
  formatDateRange,
  continents,
  type Continent,
  type Trip,
} from "@/lib/data/trips";
import { useCart } from "@/components/providers/CartContext";
import { useTripFocus } from "@/components/providers/TripFocusContext";
import { openWaitlist } from "@/components/shop/WaitlistModal";
import { Icon } from "@/components/ui/Icon";
import MixedTitle from "@/components/ui/MixedTitle";
import TiltCard from "@/components/anim/TiltCard";
import TripSpine from "@/components/trips/TripSpine";
import { scrollToId } from "@/lib/scroll";
import { clsx } from "@/lib/clsx";
import TripCover from "@/components/ui/TripCover";

type Filter = "Wszystkie" | Continent;

const filters: Filter[] = ["Wszystkie", ...continents];

const statusLabel: Record<Trip["status"], { text: string; cls: string }> = {
  open: { text: "Wolne miejsca", cls: "bg-sage/15 text-sage-dark" },
  "few-left": { text: "Ostatnie miejsca", cls: "bg-blush/30 text-ink" },
  soldout: { text: "Brak miejsc", cls: "bg-ink/10 text-ink-soft" },
  upcoming: { text: "Wkrótce", cls: "bg-ecru text-ink-soft" },
};

function byFilter(trips: Trip[], filter: Filter): Trip[] {
  return filter === "Wszystkie"
    ? trips
    : trips.filter((t) => t.continent === filter);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Destinations({ trips }: { trips: Trip[] }) {
  /** Filtr klikniety przez uzytkowniczke. */
  const [filter, setFilter] = useState<Filter>("Wszystkie");
  /** Filtr aktualnie wyrenderowany — zmienia sie dopiero po animacji wyjscia. */
  const [rendered, setRendered] = useState<Filter>("Wszystkie");

  const gridRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const { addTrip } = useCart();
  const { preview, pin } = useTripFocus();

  /** Pigulka pod aktywna kategoria plynnie przesuwa sie miedzy zakladkami. */
  const moveIndicator = useCallback(() => {
    const tabs = tabsRef.current;
    const indicator = indicatorRef.current;
    if (!tabs || !indicator) return;

    const active = tabs.querySelector<HTMLElement>(`[data-filter="${filter}"]`);
    if (!active) return;

    gsap.to(indicator, {
      x: active.offsetLeft,
      y: active.offsetTop,
      width: active.offsetWidth,
      height: active.offsetHeight,
      duration: prefersReducedMotion() ? 0 : 0.45,
      ease: "power3.out",
    });
  }, [filter]);

  useLayoutEffect(() => {
    moveIndicator();
  }, [moveIndicator]);

  useEffect(() => {
    window.addEventListener("resize", moveIndicator);
    return () => window.removeEventListener("resize", moveIndicator);
  }, [moveIndicator]);

  /** Zmiana kontynentu: kafelki wychodza kaskadowo, potem wchodza nowe. */
  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    setFilter(next);

    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) {
      setRendered(next);
      return;
    }

    // Blokujemy wysokosc siatki na czas przejscia, zeby sekcja nie „skakala".
    grid.style.minHeight = `${grid.offsetHeight}px`;

    gsap.to(grid.querySelectorAll("[data-trip-card]"), {
      opacity: 0,
      y: -16,
      scale: 0.97,
      duration: 0.28,
      stagger: 0.05,
      ease: "power2.in",
      onComplete: () => setRendered(next),
    });
  };

  /** Wejscie nowego zestawu kafelkow po zmianie kontynentu. */
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll("[data-trip-card]");
    if (cards.length === 0 || prefersReducedMotion()) {
      grid.style.minHeight = "";
      return;
    }

    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 22, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "power3.out",
        clearProps: "opacity,transform",
        onComplete: () => {
          grid.style.minHeight = "";
        },
      }
    );

    return () => {
      tween.kill();
    };
  }, [rendered]);

  /** „Plan dzien po dniu" — przypina wyjazd i przewija do osi czasu. */
  const showPlan = (slug: string) => {
    pin(slug);
    scrollToId("plan-podrozy");
  };

  const visible = byFilter(trips, rendered);

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

          {/* Kategorie wyjazdów — pigułka płynnie jedzie za wyborem. */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Filtruj wyjazdy po kontynencie"
            className="relative flex flex-wrap gap-2"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-full bg-sage"
            />
            {filters.map((f) => (
              <button
                key={f}
                data-filter={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => changeFilter(f)}
                className={clsx(
                  "relative z-10 rounded-full px-4 py-2 text-sm transition-colors duration-300",
                  filter === f
                    ? "text-ivory"
                    : "bg-ivory text-ink-soft hover:bg-sand"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={gridRef}
          className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((trip) => {
            const left = spotsLeft(trip);
            const badge = statusLabel[trip.status];
            const soldout = isSoldOut(trip);

            return (
              <TiltCard key={trip.slug} className="h-full" data-trip-card>
                <article
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-ivory shadow-md shadow-ink/10 ring-1 ring-ink/5 transition-shadow hover:shadow-xl hover:shadow-ink/15"
                  onMouseEnter={() => preview(trip.slug)}
                  onMouseLeave={() => preview(null)}
                  onFocusCapture={() => preview(trip.slug)}
                  onBlurCapture={() => preview(null)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <TripCover
                      src={trip.coverImage}
                      alt={trip.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      className={clsx(
                        "absolute left-4 top-4 z-20 rounded-full px-3 py-1 text-xs font-medium backdrop-blur",
                        badge.cls
                      )}
                    >
                      {badge.text}
                    </span>

                    {/* Mini-oś czasu tego wyjazdu — pojawia się po wskazaniu. */}
                    <TripSpine trip={trip} />
                  </div>

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

                      {/* Warstwa interaktywna ponad „rozciągniętym" linkiem. */}
                      <div className="relative z-20">
                        {soldout ? (
                          <button
                            onClick={() => openWaitlist(trip)}
                            className="mt-4 w-full rounded-full border border-ink/20 py-3 text-sm transition-colors hover:bg-ink/5"
                          >
                            Lista rezerwowa
                          </button>
                        ) : (
                          <button
                            onClick={() => void addTrip(trip)}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage py-3 text-sm text-ivory transition-colors hover:bg-sage-dark"
                          >
                            Chcę jechać!
                            <Icon name="dolphin" className="h-5 w-5" />
                          </button>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <button
                            onClick={() => showPlan(trip.slug)}
                            className="text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
                          >
                            Plan dzień po dniu
                          </button>
                          <span className="inline-flex items-center gap-1 text-sage-dark transition-transform duration-300 group-hover:translate-x-0.5">
                            Szczegóły →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cały kafelek prowadzi do szczegółów wyjazdu. Link jest
                      „rozciągnięty" pod treścią, więc przyciski wyżej (z-20)
                      działają po staremu i nie zagnieżdżamy interaktywnych
                      elementów w <a>. */}
                  <Link
                    href={`/wyjazdy/${trip.slug}`}
                    data-transition-title={trip.title}
                    data-transition-eyebrow={`${trip.continent} · ${trip.durationDays} dni`}
                    data-transition-image={trip.coverImage}
                    className="absolute inset-0 z-10 rounded-[1.75rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                  >
                    <span className="sr-only">
                      Zobacz szczegóły wyjazdu {trip.title}
                    </span>
                  </Link>
                </article>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
