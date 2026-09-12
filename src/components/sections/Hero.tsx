"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Trip } from "@/lib/data/trips";
import { Icon } from "@/components/ui/Icon";

/** Rotujące hasła nakładane na wideo (slajd ogólny + po jednym na wyjazd). */
interface Slide {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  /* Dane dla kurtyny przejścia (RouteTransition). */
  transition?: { title: string; image: string };
}

function buildSlides(trips: Trip[]): Slide[] {
  return [
    {
      eyebrow: "3 destynacje · 15 dni",
      title: "Przygoda życia",
      text: "Trzy raje, jedna czuła podróż. Słońce, warsztaty, ruch i czas tylko dla siebie.",
      href: "#destynacje",
    },
    ...trips.map((t) => ({
      eyebrow: `${t.country} · ${t.durationDays} dni`,
      title: t.title,
      text: t.tagline,
      href: `/wyjazdy/${t.slug}`,
      transition: { title: t.title, image: t.coverImage },
    })),
  ];
}

export default function Hero({ trips }: { trips: Trip[] }) {
  const slides = useMemo(() => buildSlides(trips), [trips]);
  const [active, setActive] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-przewijanie haseł.
  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      6000
    );
    return () => clearInterval(id);
  }, [slides.length]);

  // Animacja treści przy zmianie slajdu.
  useEffect(() => {
    if (!contentRef.current) return;
    const els = contentRef.current.querySelectorAll("[data-anim]");
    gsap.fromTo(
      els,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" }
    );
  }, [active]);

  return (
    // Hero „przyklejony": zostaje na miejscu (fixed), a treść poniżej nasuwa
    // się na niego (patrz mt-[100svh] na owijce treści w page.tsx).
    <section className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden">
      {/* Wideo w tle (plaża + fale). Klientki podmienią plik na /media/hero.mp4 */}
      {/* Wideo jest dekoracją i zostaje wyciszone — dźwiękiem strony steruje
          globalny przełącznik (patrz AmbientSoundProvider). */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?q=80&w=2000&auto=format&fit=crop"
      >
        <source src="/media/hero.mp4" type="video/mp4" />
        {/* Tymczasowy materiał poglądowy (do podmiany na własny film): */}
        <source
          src="https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/25 to-ink/10" />

      <div className="section-pad relative z-10 flex h-full flex-col justify-center">
        <div ref={contentRef} className="max-w-xl text-ivory">
          <p
            data-anim
            className="text-sm uppercase tracking-[0.3em] text-ivory/80"
          >
            {slides[active].eyebrow}
          </p>
          <h1
            data-anim
            className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl"
          >
            {slides[active].title}
          </h1>
          <p data-anim className="mt-5 max-w-md text-base text-ivory/90">
            {slides[active].text}
          </p>
          <a
            data-anim
            href={slides[active].href}
            data-transition-title={slides[active].transition?.title}
            data-transition-eyebrow={
              slides[active].transition ? slides[active].eyebrow : undefined
            }
            data-transition-image={slides[active].transition?.image}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            Odkryj podróż
            <Icon name="palm" className="h-5 w-5 text-sage" />
          </a>
        </div>

        {/* Kropki nawigacji */}
        <div className="absolute bottom-10 left-0 flex w-full items-center justify-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slajd ${i + 1}`}
              onClick={() => setActive(i)}
              className="h-2.5 rounded-full bg-ivory transition-all duration-300"
              style={{
                width: i === active ? 34 : 10,
                opacity: i === active ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
