"use client";

import { useAmbientSound } from "@/components/providers/AmbientSoundContext";

/**
 * Przełącznik dźwięku w tle.
 *
 * Przypięty do okna (a nie do hero), więc da się wyciszyć stronę także po
 * przewinięciu. Gdy pliku z dźwiękiem nie ma, przycisk się nie pojawia —
 * lepiej brak kontrolki niż kontrolka, która nic nie robi.
 */
export default function SoundToggle() {
  const { available, playing, toggle } = useAmbientSound();

  if (!available) return null;

  return (
    <button
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Wycisz dźwięk strony" : "Włącz szum morza"}
      title={playing ? "Wycisz" : "Włącz szum morza"}
      className="fixed bottom-6 left-6 z-[76] flex h-12 w-12 items-center justify-center rounded-full border border-ivory/40 bg-ink/30 text-ivory backdrop-blur transition-colors hover:bg-ink/50"
    >
      {playing ? (
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
  );
}
