"use client";

import { useEffect, useState } from "react";

function remainingSeconds(deadline: string): number {
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
}

/**
 * Odliczanie do wygaśnięcia blokady miejsc.
 *
 * Klientka widzi, ile czasu ma na dokończenie rezerwacji — to uczciwsze niż
 * ciche zwolnienie miejsca w tle i komunikat o błędzie przy płatności.
 */
export default function HoldCountdown({
  expiresAt,
  className,
}: {
  expiresAt: string;
  className?: string;
}) {
  const [seconds, setSeconds] = useState(() => remainingSeconds(expiresAt));

  useEffect(() => {
    setSeconds(remainingSeconds(expiresAt));
    const interval = setInterval(() => {
      setSeconds(remainingSeconds(expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (seconds <= 0) {
    return (
      <span className={className}>Blokada miejsc wygasła — odśwież koszyk</span>
    );
  }

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return (
    <span className={className}>
      Miejsca czekają jeszcze{" "}
      <time dateTime={expiresAt} className="font-medium tabular-nums">
        {minutes}:{String(rest).padStart(2, "0")}
      </time>
    </span>
  );
}
