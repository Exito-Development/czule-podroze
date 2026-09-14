"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatDateRange, type Trip } from "@/lib/data/trips";
import { useTripFocus } from "@/components/providers/TripFocusContext";
import { Icon } from "@/components/ui/Icon";
import { clsx } from "@/lib/clsx";

const tagColor: Record<string, string> = {
  warsztat: "bg-blush/40 text-ink",
  fitness: "bg-sage/20 text-sage-dark",
  relaks: "bg-ecru text-ink-soft",
  wycieczka: "bg-sand text-ink",
  kultura: "bg-sand text-ink",
  integracja: "bg-blush/30 text-ink",
};

/**
 * „Plan podróży" — jedna oś czasu, ale osobna dla każdego wyjazdu.
 *
 * Wyjazd wybieramy przełącznikiem u góry (klik = przypięcie) albo po prostu
 * wskazujemy kafelek w sekcji „Nasze wyjazdy" (hover = podgląd). Przy każdej
 * zmianie oś jest przerysowywana: linia wyrasta od nowa, kolejne dni wjeżdżają
 * kaskadowo z naprzemiennych stron, a delfin-znacznik jedzie po linii razem
 * ze scrollem, pokazując, jak daleko jesteśmy w planie.
 */
export default function TripTimeline({ trips }: { trips: Trip[] }) {
  const { focusedSlug, pinnedSlug, pin, preview } = useTripFocus();
  // Dopóki nikt nic nie wskazał, pokazujemy pierwszy wyjazd z oferty.
  const trip: Trip | undefined =
    trips.find((candidate) => candidate.slug === focusedSlug) ?? trips[0];

  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const timeline = timelineRef.current;
    if (!root || !timeline) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      gsap.set(root.querySelectorAll("[data-swap], [data-day]"), {
        opacity: 1,
        x: 0,
        y: 0,
      });
      gsap.set(lineRef.current, { scaleY: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Nagłówek i karty boczne — miękka podmiana treści.
      gsap.fromTo(
        "[data-swap]",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
      );

      // Dni wjeżdżają naprzemiennie z lewej i prawej strony osi.
      gsap.fromTo(
        "[data-day]",
        {
          opacity: 0,
          y: 26,
          x: (i: number) => (i % 2 === 0 ? -18 : 18),
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.55,
          stagger: 0.055,
          ease: "power3.out",
          clearProps: "transform",
        }
      );

      // Linia „rośnie" wraz ze scrollem…
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: timeline,
            start: "top 65%",
            end: "bottom 80%",
            scrub: true,
          },
        }
      );

      // …a delfin płynie po niej razem z postępem czytania.
      gsap.fromTo(
        markerRef.current,
        { y: 0, opacity: 0 },
        {
          y: () => timeline.offsetHeight,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 65%",
            end: "bottom 80%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, root);

    // Zmiana wyjazdu zmienia wysokość osi — pozycje ScrollTriggerów muszą się przeliczyć.
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [trip?.slug]);

  // Brak oferty (np. wszystkie wyjazdy niepublikowane) — nie ma czego rysować.
  if (!trip) return null;

  return (
    <section id="plan-podrozy" className="section-pad section-y bg-ivory">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
            Dzień po dniu
          </p>
          <h2 data-swap className="mt-3 font-serif text-4xl md:text-5xl">
            {trip.title}
          </h2>
          <p data-swap className="mt-3 text-ink-soft">
            {trip.tagline}
          </p>
          <p data-swap className="mt-1 text-sm text-ink-soft/80">
            {formatDateRange(trip.startDate, trip.endDate)} · {trip.durationDays}{" "}
            dni
            {trip.itinerary.length < trip.durationDays &&
              ` · plan na ${trip.itinerary.length} pierwszych dni`}
          </p>
        </div>

        {/* Przełącznik wyjazdów — każdy ma własną oś czasu. */}
        <div
          role="tablist"
          aria-label="Wybierz wyjazd, którego plan chcesz zobaczyć"
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {trips.map((t) => {
            const isFocused = t.slug === trip.slug;
            const isPinned = t.slug === pinnedSlug;
            return (
              <button
                key={t.slug}
                role="tab"
                aria-selected={isFocused}
                onClick={() => pin(t.slug)}
                onMouseEnter={() => preview(t.slug)}
                onMouseLeave={() => preview(null)}
                onFocus={() => preview(t.slug)}
                onBlur={() => preview(null)}
                className={clsx(
                  "group flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 text-left transition-all duration-300",
                  isFocused
                    ? "bg-sage text-ivory shadow-md shadow-sage/30"
                    : "bg-cream/70 text-ink-soft hover:bg-sand"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.coverImage}
                  alt=""
                  aria-hidden
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-ivory/70"
                />
                <span>
                  <span className="block font-serif text-sm leading-tight">
                    {t.title}
                  </span>
                  <span
                    className={clsx(
                      "block text-[0.7rem] leading-tight",
                      isFocused ? "text-ivory/75" : "text-ink-soft/70"
                    )}
                  >
                    {t.durationDays} dni
                    {isPinned && !isFocused ? " · wybrany" : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Oś czasu wybranego wyjazdu */}
        <div ref={rootRef}>
          <div ref={timelineRef} className="relative mt-14 pl-10 md:pl-0">
            {/* Tor linii */}
            <div className="absolute left-[14px] top-0 h-full w-px bg-ink/10 md:left-1/2" />
            {/* Linia animowana */}
            <div
              ref={lineRef}
              className="absolute left-[14px] top-0 h-full w-px origin-top bg-sage md:left-1/2"
              style={{ transform: "scaleY(0)" }}
            />
            {/* Delfin płynący po osi razem ze scrollem */}
            <div
              ref={markerRef}
              aria-hidden
              className="pointer-events-none absolute left-[14px] top-0 z-10 -translate-x-1/2 text-sage-dark opacity-0 md:left-1/2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory shadow-md shadow-ink/10 ring-1 ring-sage/40">
                <Icon name="dolphin" className="h-5 w-5" />
              </span>
            </div>

            <div className="space-y-12">
              {trip.itinerary.map((d, i) => (
                <div
                  key={`${trip.slug}-${d.day}`}
                  data-day
                  className={clsx(
                    "relative md:flex md:items-center md:gap-8",
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Kropka */}
                  <span className="absolute -left-[34px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-sage text-xs text-ivory md:left-1/2 md:-translate-x-1/2">
                    {d.day}
                  </span>

                  <div className="md:w-1/2" />
                  <div className="md:w-1/2">
                    <div className="rounded-2xl bg-cream/60 p-6 transition-colors duration-300 hover:bg-cream">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-sage-dark">
                        Dzień {d.day} z {trip.durationDays}
                      </p>
                      <h3 className="mt-1 font-serif text-xl">{d.title}</h3>
                      <p className="mt-2 text-sm text-ink-soft">
                        {d.description}
                      </p>
                      {d.tags && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {d.tags.map((t) => (
                            <span
                              key={t}
                              className={clsx(
                                "rounded-full px-3 py-1 text-xs",
                                tagColor[t] ?? "bg-sand text-ink"
                              )}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* W cenie + gift bag — też per wyjazd */}
          <div className="mt-20 grid gap-8 md:grid-cols-5">
            <div data-swap className="rounded-3xl bg-sage/10 p-8 md:col-span-3">
              <h3 className="font-serif text-2xl">W cenie</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {trip.included.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink-soft">
                    <span className="text-sage-dark">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div data-swap className="rounded-3xl bg-blush/20 p-8 md:col-span-2">
              <Icon name="sparkle" className="h-8 w-8 text-blush" />
              <h3 className="mt-4 font-serif text-2xl">Gift bag powitalny</h3>
              <p className="mt-3 text-sm text-ink-soft">
                Na każdą z Was czeka starannie skomponowany upominek powitalny —
                drobiazgi, które umilą podróż i zostaną pamiątką z wyjazdu.
              </p>
              <Link
                href={`/wyjazdy/${trip.slug}`}
                data-transition-title={trip.title}
                data-transition-eyebrow={`${trip.continent} · ${trip.durationDays} dni`}
                data-transition-image={trip.coverImage}
                className="mt-5 inline-flex items-center gap-2 text-sm text-ink underline-offset-4 hover:underline"
              >
                Zobacz cały wyjazd {trip.title} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
