"use client";

import { useState } from "react";
import { workshops } from "@/lib/data/site";
import MixedTitle from "@/components/ui/MixedTitle";
import ParallaxImg from "@/components/anim/ParallaxImg";
import { clsx } from "@/lib/clsx";

/**
 * Rodzaje warsztatów w zakładkach — układ inspirowany sekcją
 * „Experience the Ultimate Coworking Lifestyle" z CoParadiso:
 * tropikalne tło z przyciemnieniem, zakładki u góry, panel z obrazem i opisem.
 */
export default function Workshops() {
  const [active, setActive] = useState(0);
  const current = workshops[active];

  return (
    <section className="section-y relative overflow-hidden">
      {/* Tropikalne tło z paralaksą (efekt głębi przy scrollu) */}
      <ParallaxImg src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2000&auto=format&fit=crop" />
      <div className="absolute inset-0 bg-sage-dark/75" />

      <div className="section-pad relative z-10 mx-auto max-w-5xl">
        <div className="text-center text-ivory">
          <h2 className="text-4xl leading-tight md:text-5xl">
            <MixedTitle
              text="Warsztaty, które *zostają z ~Tobą"
              displayClass="font-display text-blush-soft"
              scriptClass="font-script text-blush-soft"
            />
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-ivory/80">
            Wybierz temat, który Cię woła
          </p>
        </div>

        {/* Zakładki */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {workshops.map((w, i) => (
            <button
              key={w.id}
              onClick={() => setActive(i)}
              className={clsx(
                "rounded-full px-5 py-2.5 text-sm transition-colors",
                i === active
                  ? "bg-ivory text-ink"
                  : "bg-ivory/15 text-ivory hover:bg-ivory/25"
              )}
            >
              {w.title}
            </button>
          ))}
        </div>

        {/* Panel zawartości */}
        <div className="mt-8 overflow-hidden rounded-[2rem] bg-ivory shadow-2xl md:grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="font-script text-2xl text-blush">{current.tagline}</p>
            <h3 className="mt-2 font-serif text-3xl">{current.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {current.description}
            </p>
            <div className="mt-7 flex gap-3">
              <a
                href="#destynacje"
                className="rounded-full bg-sage px-6 py-3 text-sm text-ivory transition-colors hover:bg-sage-dark"
              >
                Zobacz wyjazdy
              </a>
              <a
                href="#kontakt"
                className="rounded-full border border-ink/20 px-6 py-3 text-sm transition-colors hover:bg-ink/5"
              >
                Zapytaj o warsztat
              </a>
            </div>
          </div>

          <div className="relative min-h-[260px] md:min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image}
              alt={current.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
