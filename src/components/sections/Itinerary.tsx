"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getTripBySlug } from "@/lib/data/trips";
import { Icon } from "@/components/ui/Icon";

const trip = getTripBySlug("tajlandia-bali")!;

const tagColor: Record<string, string> = {
  warsztat: "bg-blush/40 text-ink",
  fitness: "bg-sage/20 text-sage-dark",
  relaks: "bg-ecru text-ink-soft",
  wycieczka: "bg-sand text-ink",
  kultura: "bg-sand text-ink",
  integracja: "bg-blush/30 text-ink",
};

export default function Itinerary() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !root.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Linia osi czasu "rośnie" wraz ze scrollem.
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: root.current,
            start: "top 60%",
            end: "bottom 75%",
            scrub: true,
          },
        }
      );

      // Wejście kolejnych dni.
      gsap.utils.toArray<HTMLElement>("[data-day]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%" },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-pad section-y bg-ivory">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
            Dzień po dniu
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            {trip.title}
          </h2>
          <p className="mt-3 text-ink-soft">{trip.tagline}</p>
        </div>

        {/* Oś czasu */}
        <div ref={root} className="relative mt-16 pl-10 md:pl-0">
          {/* Tor linii */}
          <div className="absolute left-[14px] top-0 h-full w-px bg-ink/10 md:left-1/2" />
          {/* Linia animowana */}
          <div
            ref={line}
            className="absolute left-[14px] top-0 h-full w-px bg-sage md:left-1/2"
            style={{ transform: "scaleY(0)" }}
          />

          <div className="space-y-12">
            {trip.itinerary.map((d, i) => (
              <div
                key={d.day}
                data-day
                className={`relative md:flex md:items-center md:gap-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Kropka */}
                <span className="absolute -left-[34px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-sage text-xs text-ivory md:left-1/2 md:-translate-x-1/2">
                  {d.day}
                </span>

                <div className="md:w-1/2" />
                <div className="md:w-1/2">
                  <div className="rounded-2xl bg-cream/60 p-6">
                    <h3 className="font-serif text-xl">{d.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft">
                      {d.description}
                    </p>
                    {d.tags && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {d.tags.map((t) => (
                          <span
                            key={t}
                            className={`rounded-full px-3 py-1 text-xs ${
                              tagColor[t] ?? "bg-sand text-ink"
                            }`}
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

        {/* W cenie + gift bag */}
        <div className="mt-20 grid gap-8 md:grid-cols-5">
          <div className="rounded-3xl bg-sage/10 p-8 md:col-span-3">
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

          <div className="rounded-3xl bg-blush/20 p-8 md:col-span-2">
            <Icon name="sparkle" className="h-8 w-8 text-blush" />
            <h3 className="mt-4 font-serif text-2xl">Gift bag powitalny</h3>
            <p className="mt-3 text-sm text-ink-soft">
              Na każdą z Was czeka starannie skomponowany upominek powitalny —
              drobiazgi, które umilą podróż i zostaną pamiątką z wyjazdu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
