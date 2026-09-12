"use client";

import { useEffect, useState } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Modal listy rezerwowej. Otwierany globalnym eventem:
 *   window.dispatchEvent(new CustomEvent("open-waitlist", { detail: { trip } }))
 *
 * Dzięki temu dowolny kafelek/przycisk może go wywołać bez prop-drillingu.
 * Wysyłkę formularza podłączymy do backendu później — teraz tylko UI + walidacja.
 */
export interface WaitlistTarget {
  slug: string;
  title: string;
}

export function openWaitlist(trip: WaitlistTarget) {
  window.dispatchEvent(new CustomEvent("open-waitlist", { detail: { trip } }));
}

export default function WaitlistModal() {
  const [trip, setTrip] = useState<WaitlistTarget | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { trip: WaitlistTarget };
      setTrip(detail.trip);
      setSent(false);
    };
    window.addEventListener("open-waitlist", handler);
    return () => window.removeEventListener("open-waitlist", handler);
  }, []);

  const close = () => setTrip(null);

  const isOpen = trip !== null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[90] flex items-center justify-center p-4 transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-ivory p-8 shadow-2xl">
        <button
          onClick={close}
          aria-label="Zamknij"
          className="absolute right-5 top-5 text-xl text-ink/50 hover:text-ink"
        >
          ✕
        </button>

        {!sent ? (
          <>
            <h3 className="font-serif text-2xl">Lista rezerwowa</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Wyjazd <strong>{trip?.title}</strong> nie ma już wolnych miejsc. Zostaw
              kontakt — damy Ci znać, gdy zwolni się miejsce lub ruszy kolejna
              edycja.
            </p>

            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: POST do backendu (Spring Boot) — zapis na listę.
                setSent(true);
              }}
            >
              <input
                required
                type="text"
                placeholder="Imię"
                className="w-full rounded-full border border-ink/15 bg-cream/50 px-5 py-3 text-sm outline-none focus:border-sage"
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                className="w-full rounded-full border border-ink/15 bg-cream/50 px-5 py-3 text-sm outline-none focus:border-sage"
              />
              <input
                type="tel"
                placeholder="Telefon (opcjonalnie)"
                className="w-full rounded-full border border-ink/15 bg-cream/50 px-5 py-3 text-sm outline-none focus:border-sage"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-sage py-3.5 text-ivory transition-colors hover:bg-sage-dark"
              >
                Zapisz mnie na listę
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="text-4xl">🐬</div>
            <h3 className="mt-4 font-serif text-2xl">Jesteś na liście!</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Odezwiemy się, gdy tylko pojawi się miejsce na wyjazd{" "}
              <strong>{trip?.title}</strong>.
            </p>
            <button
              onClick={close}
              className="mt-6 rounded-full border border-ink/20 px-6 py-2.5 text-sm hover:bg-ink/5"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
