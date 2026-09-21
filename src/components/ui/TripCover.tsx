"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { Icon } from "@/components/ui/Icon";

/**
 * Zdjęcie wyjazdu z zastępnikiem.
 *
 * Adres zdjęcia pochodzi z panelu, więc bywa pusty albo przestaje działać po
 * czasie (link wygasa, autor kasuje plik). Bez zastępnika zostaje w tym miejscu
 * dziura albo — gorzej — ikona zepsutego obrazka przy ofercie sprzedażowej.
 * Zastępnik jest celowo bezosobowy: przypadkowe zdjęcie człowieka sugerowałoby
 * konkretną uczestniczkę albo prowadzącą.
 */
export default function TripCover({
  src,
  alt,
  className,
  decorative,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  /** Gdy podpis jest już obok, zdjęcie nie powtarza go czytnikom ekranu. */
  decorative?: boolean;
}) {
  const [bladWczytywania, setBladWczytywania] = useState(false);
  const brakZdjecia = !src || src.trim() === "" || bladWczytywania;

  if (brakZdjecia) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center bg-gradient-to-br from-sand via-blush-pale to-sage-pale",
          className
        )}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : alt}
        aria-hidden={decorative || undefined}
      >
        <Icon name="palm" className="h-1/3 max-h-16 w-auto text-sage-dark/50" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      onError={() => setBladWczytywania(true)}
      className={className}
    />
  );
}
