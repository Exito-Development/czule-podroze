"use client";

import { useState } from "react";
import { workshops } from "@/lib/data/site";
import MixedTitle from "@/components/ui/MixedTitle";
import ParallaxImg from "@/components/anim/ParallaxImg";
import { clsx } from "@/lib/clsx";

/**
 * Rodzaje warsztatów w zakładkach.
 *
 * Wszystkie panele renderujemy w jednej komórce siatki (`[grid-area:1/1]`),
 * więc wysokość kontenera to zawsze wysokość NAJWYŻSZEGO panelu — zmiana
 * zakładki nie zmienia układu strony i tło przestaje „skakać". Nieaktywne
 * panele są wygaszone i wyjęte z drzewa dostępności, a przejście to płynny
 * crossfade: treść wjeżdża z dołu, zdjęcie delikatnie się oddala.
 */
export default function Workshops() {
  const [active, setActive] = useState(0);

  return (
    <section className="section-y relative overflow-hidden">
      {/* Tropikalne tło z paralaksą (efekt głębi przy scrollu) */}
      <ParallaxImg src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2000&auto=format&fit=crop" />
      <div className="absolute inset-0 bg-sage-dark/75" />

      <div className="section-pad relative z-10 mx-auto max-w-5xl">
        <div className="text-center text-ivory">
          <h2 className="text-4xl leading-tight md:text-5xl">
            <MixedTitle
              text="*Warsztaty, które zostają z ~Tobą"
              displayClass="font-display text-blush-soft"
              scriptClass="font-script text-blush-soft"
            />
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-ivory/80">
            Wybierz temat, który Cię woła
          </p>
        </div>

        {/* Zakładki */}
        <div
          role="tablist"
          aria-label="Rodzaje warsztatów"
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {workshops.map((w, i) => (
            <button
              key={w.id}
              role="tab"
              id={`warsztat-tab-${w.id}`}
              aria-selected={i === active}
              aria-controls={`warsztat-panel-${w.id}`}
              onClick={() => setActive(i)}
              className={clsx(
                "rounded-full px-5 py-2.5 text-sm transition-all duration-300",
                i === active
                  ? "bg-ivory text-ink shadow-lg shadow-ink/20"
                  : "bg-ivory/15 text-ivory hover:bg-ivory/25"
              )}
            >
              {w.title}
            </button>
          ))}
        </div>

        {/* Panel zawartości — wszystkie warianty w tej samej komórce siatki,
            dzięki czemu wysokość jest stała i nic nie „podskakuje". */}
        <div className="mt-8 grid overflow-hidden rounded-[2rem] bg-ivory shadow-2xl">
          {workshops.map((w, i) => {
            const isActive = i === active;
            return (
              <div
                key={w.id}
                id={`warsztat-panel-${w.id}`}
                role="tabpanel"
                aria-labelledby={`warsztat-tab-${w.id}`}
                aria-hidden={!isActive}
                className={clsx(
                  "[grid-area:1/1] transition-opacity duration-500 ease-out md:grid md:grid-cols-2",
                  isActive
                    ? "opacity-100"
                    : "pointer-events-none select-none opacity-0"
                )}
              >
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div
                    className={clsx(
                      "transition-all duration-500 ease-out",
                      isActive
                        ? "translate-y-0 opacity-100 delay-100"
                        : "translate-y-4 opacity-0"
                    )}
                  >
                    <p className="font-script text-2xl text-blush">
                      {w.tagline}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl">{w.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                      {w.description}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <a
                        href="#destynacje"
                        tabIndex={isActive ? undefined : -1}
                        className="rounded-full bg-sage px-6 py-3 text-sm text-ivory transition-colors hover:bg-sage-dark"
                      >
                        Zobacz wyjazdy
                      </a>
                      <a
                        href="#kontakt"
                        tabIndex={isActive ? undefined : -1}
                        className="rounded-full border border-ink/20 px-6 py-3 text-sm transition-colors hover:bg-ink/5"
                      >
                        Zapytaj o warsztat
                      </a>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[260px] overflow-hidden md:min-h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.image}
                    alt={w.title}
                    loading="lazy"
                    className={clsx(
                      "h-full w-full object-cover transition-transform duration-[900ms] ease-out",
                      isActive ? "scale-100" : "scale-110"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Wskaźnik postępu — która zakładka z ilu */}
        <div className="mt-6 flex justify-center gap-1.5">
          {workshops.map((w, i) => (
            <span
              key={w.id}
              aria-hidden
              className={clsx(
                "h-1 rounded-full transition-all duration-500",
                i === active ? "w-8 bg-ivory" : "w-3 bg-ivory/35"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
