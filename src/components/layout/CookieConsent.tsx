"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  TYLKO_NIEZBEDNE,
  WSZYSTKIE,
  wczytajZgode,
  zapiszZgode,
} from "@/lib/cookies";

/**
 * Baner zgody na pliki cookie.
 *
 * Obie odpowiedzi wyglądają tak samo. To nie jest kwestia gustu: baner, w
 * którym „akceptuję" jest wyraźnym przyciskiem, a odmowa bladym linkiem,
 * organy nadzoru traktują jako wymuszanie zgody — a taka zgoda jest nieważna.
 */
export default function CookieConsent() {
  const [widoczny, setWidoczny] = useState(false);
  const [szczegoly, setSzczegoly] = useState(false);
  const [analityczne, setAnalityczne] = useState(false);
  const pierwszyPrzycisk = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!wczytajZgode()) setWidoczny(true);
    const otworz = () => {
      const zgoda = wczytajZgode();
      setAnalityczne(zgoda?.kategorie.analityczne ?? false);
      setSzczegoly(true);
      setWidoczny(true);
    };
    window.addEventListener("czula:otworz-cookies", otworz);
    return () => window.removeEventListener("czula:otworz-cookies", otworz);
  }, []);

  useEffect(() => {
    if (widoczny) pierwszyPrzycisk.current?.focus();
  }, [widoczny]);

  const rozstrzygnij = useCallback((kategorie: typeof WSZYSTKIE) => {
    zapiszZgode(kategorie);
    setWidoczny(false);
    setSzczegoly(false);
  }, []);

  if (!widoczny) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookies-tytul"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-2xl border border-ink/10 bg-ivory/95 p-5 shadow-xl backdrop-blur md:inset-x-auto md:left-6 md:right-auto"
    >
      <p id="cookies-tytul" className="font-serif text-lg">
        Pliki cookie
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Niezbędne pliki cookie pozwalają działać koszykowi i rezerwacji — bez nich
        strona nie zadziała. Analityczne pomagają nam zrozumieć, co się przydaje, a
        co przeszkadza. Zgodę możesz zmienić w każdej chwili.{" "}
        <Link href="/polityka-prywatnosci" className="underline hover:text-ink">
          Polityka prywatności
        </Link>
        .
      </p>

      {szczegoly && (
        <div className="mt-4 space-y-3 rounded-xl bg-cream/60 p-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span>
              <strong className="block">Niezbędne</strong>
              <span className="text-ink-soft">
                Koszyk, blokada miejsca, zapamiętanie zgody. Zawsze włączone.
              </span>
            </span>
            <input type="checkbox" checked disabled aria-label="Niezbędne — zawsze włączone" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <span>
              <strong className="block">Analityczne</strong>
              <span className="text-ink-soft">
                Anonimowe statystyki odwiedzin. Możesz je wyłączyć.
              </span>
            </span>
            <input
              type="checkbox"
              checked={analityczne}
              onChange={(event) => setAnalityczne(event.target.checked)}
              aria-label="Analityczne"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {/* Oba przyciski mają identyczną wagę wizualną — patrz komentarz wyżej. */}
        <button
          ref={pierwszyPrzycisk}
          onClick={() => rozstrzygnij(WSZYSTKIE)}
          className="rounded-full bg-sage px-5 py-2 text-sm text-ivory transition-colors hover:bg-sage-dark"
        >
          Akceptuję wszystkie
        </button>
        <button
          onClick={() => rozstrzygnij(TYLKO_NIEZBEDNE)}
          className="rounded-full bg-sage px-5 py-2 text-sm text-ivory transition-colors hover:bg-sage-dark"
        >
          Tylko niezbędne
        </button>
        {szczegoly ? (
          <button
            onClick={() =>
              rozstrzygnij({ niezbedne: true, analityczne })
            }
            className="rounded-full border border-ink/20 px-5 py-2 text-sm hover:bg-ink/5"
          >
            Zapisz mój wybór
          </button>
        ) : (
          <button
            onClick={() => setSzczegoly(true)}
            className="rounded-full border border-ink/20 px-5 py-2 text-sm hover:bg-ink/5"
          >
            Dostosuj
          </button>
        )}
      </div>
    </div>
  );
}
