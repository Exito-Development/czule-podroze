"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getTrips } from "@/lib/data/trips";
import { Icon } from "@/components/ui/Icon";

/** Rotujące hasła nakładane na wideo (slajd ogólny + po jednym na wyjazd). */
const trips = getTrips();
const slides = [
  {
    eyebrow: "3 destynacje · 15 dni",
    title: "Przygoda życia",
    text: "Trzy raje, jedna czuła podróż. Słońce, warsztaty, ruch i czas tylko dla siebie.",
    href: "#destynacje",
    transition: undefined as { title: string; image: string } | undefined,
  },
  ...trips.map((t) => ({
    eyebrow: `${t.country} · ${t.durationDays} dni`,
    title: t.title,
    text: t.tagline,
    href: `/wyjazdy/${t.slug}`,
    /* Dane dla kurtyny przejścia (RouteTransition). */
    transition: { title: t.title, image: t.coverImage },
  })),
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-przewijanie haseł.
  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

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

  // Włącznik dźwięku (szum morza z wideo). Autoplay z dźwiękiem jest blokowany,
  // więc start jest wyciszony — pierwsze kliknięcie odblokowuje audio.
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setSoundOn(!v.muted);
  };

  return (
    // Hero „przyklejony": zostaje na miejscu (fixed), a treść poniżej nasuwa
    // się na niego (patrz mt-[100svh] na owijce treści w page.tsx).
    <section className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden">
      {/* Wideo w tle (plaża + fale). Klientki podmienią plik na /media/hero.mp4 */}
      <video
        ref={videoRef}
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

      {/* Włącznik dźwięku */}
      <button
        onClick={toggleSound}
        aria-label={soundOn ? "Wycisz" : "Włącz szum morza"}
        className="absolute bottom-6 left-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-ivory/40 bg-ink/30 text-ivory backdrop-blur transition-colors hover:bg-ink/50"
      >
        {soundOn ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M5 9v6h4l5 4V5L9 9H5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M16 9c1 1 1 5 0 6M18.5 7c2 2 2 8 0 10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M5 9v6h4l5 4V5L9 9H5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M16 10l4 4M20 10l-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </section>
  );
}
