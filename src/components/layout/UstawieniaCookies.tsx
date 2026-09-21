"use client";

import { otworzUstawieniaCookies } from "@/lib/cookies";

/** Przycisk otwierający baner zgody ponownie — zgodę trzeba dać się cofnąć. */
export default function UstawieniaCookies({ className }: { className?: string }) {
  return (
    <button type="button" onClick={otworzUstawieniaCookies} className={className}>
      Ustawienia cookies
    </button>
  );
}
