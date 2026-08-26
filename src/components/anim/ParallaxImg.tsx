"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Paralaksa tła: obraz jest wyższy niż kontener i przesuwa się wolniej
 * niż scroll (scrub), co daje efekt głębi 3D.
 */
export default function ParallaxImg({
  src,
  alt = "",
  className = "",
  /** Siła przesunięcia w % wysokości obrazu. */
  strength = 14,
}: {
  src: string;
  alt?: string;
  className?: string;
  strength?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !wrap.current || !img.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img.current,
        { yPercent: -strength },
        {
          yPercent: strength,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, wrap);
    return () => ctx.revert();
  }, [strength]);

  return (
    <div ref={wrap} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        aria-hidden={alt === ""}
        className="absolute inset-0 h-[130%] w-full -translate-y-[15%] object-cover"
      />
    </div>
  );
}
