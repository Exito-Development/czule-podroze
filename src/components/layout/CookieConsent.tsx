"use client";

import { useEffect, useState } from "react";

const KEY = "czula-podroz-cookies";

/** Prosty baner zgody na cookies (zapis w localStorage). */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (!stored) setVisible(true);
  }, []);

  const decide = (value: "all" | "necessary") => {
    localStorage.setItem(KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-2xl border border-ink/10 bg-ivory/95 p-5 shadow-xl backdrop-blur md:inset-x-auto md:left-6 md:right-auto">
      <p className="text-sm text-ink-soft">
        Używamy plików cookie, aby strona działała poprawnie i była jeszcze
        przyjemniejsza w odbiorze. Możesz zaakceptować wszystkie lub tylko
        niezbędne.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => decide("all")}
          className="rounded-full bg-sage px-5 py-2 text-sm text-ivory hover:bg-sage-dark"
        >
          Akceptuję wszystkie
        </button>
        <button
          onClick={() => decide("necessary")}
          className="rounded-full border border-ink/20 px-5 py-2 text-sm hover:bg-ink/5"
        >
          Tylko niezbędne
        </button>
      </div>
    </div>
  );
}
