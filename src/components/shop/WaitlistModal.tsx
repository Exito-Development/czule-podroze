"use client";

import { useEffect, useState } from "react";
import { ApiError, ApiUnavailableError } from "@/lib/api/client";
import { joinWaitlist } from "@/lib/api/waitlist";
import { clsx } from "@/lib/clsx";

/**
 * Modal listy rezerwowej. Otwierany globalnym eventem:
 *   window.dispatchEvent(new CustomEvent("open-waitlist", { detail: { trip } }))
 *
 * Dzięki temu dowolny kafelek/przycisk może go wywołać bez prop-drillingu.
 * Zgłoszenie trafia do API (`POST /api/v1/waitlist`), które odpowiada numerem
 * w kolejce — klientka od razu wie, jak blisko jest miejsca.
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
  const [position, setPosition] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { trip: WaitlistTarget };
      setTrip(detail.trip);
      setPosition(null);
      setProblem(null);
    };
    window.addEventListener("open-waitlist", handler);
    return () => window.removeEventListener("open-waitlist", handler);
  }, []);

  const close = () => setTrip(null);
  const isOpen = trip !== null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trip) return;

    setSending(true);
    setProblem(null);
    try {
      const entry = await joinWaitlist({
        tripSlug: trip.slug,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
      setPosition(entry.position);
    } catch (exception) {
      if (exception instanceof ApiUnavailableError) {
        setProblem(
          "Nie udało się połączyć z serwerem. Napisz do nas na kontakt@czulapodroz.pl — dopiszemy Cię ręcznie."
        );
      } else if (exception instanceof ApiError) {
        setProblem(exception.message);
      } else {
        setProblem("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
      }
    } finally {
      setSending(false);
    }
  };

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
          className="absolute right-5 top-5 text-xl text-ink/50 transition-colors hover:text-ink"
        >
          ✕
        </button>

        {position === null ? (
          <>
            <h3 className="font-serif text-2xl">Lista rezerwowa</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Wyjazd <strong>{trip?.title}</strong> nie ma już wolnych miejsc.
              Zostaw kontakt — damy Ci znać, gdy zwolni się miejsce lub ruszy
              kolejna edycja.
            </p>

            {problem && (
              <p className="mt-4 rounded-2xl bg-blush/30 px-4 py-3 text-sm text-ink">
                {problem}
              </p>
            )}

            <form className="mt-6 space-y-3" onSubmit={submit}>
              <input
                required
                type="text"
                placeholder="Imię"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-full border border-ink/15 bg-cream/50 px-5 py-3 text-sm outline-none transition-colors focus:border-sage"
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-full border border-ink/15 bg-cream/50 px-5 py-3 text-sm outline-none transition-colors focus:border-sage"
              />
              <input
                type="tel"
                placeholder="Telefon (opcjonalnie)"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="w-full rounded-full border border-ink/15 bg-cream/50 px-5 py-3 text-sm outline-none transition-colors focus:border-sage"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-sage py-3.5 text-ivory transition-colors hover:bg-sage-dark disabled:opacity-60"
              >
                {sending ? "Zapisujemy…" : "Zapisz mnie na listę"}
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="text-4xl">🐬</div>
            <h3 className="mt-4 font-serif text-2xl">Jesteś na liście!</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Jesteś <strong>{position}.</strong> w kolejce na wyjazd{" "}
              <strong>{trip?.title}</strong>. Odezwiemy się, gdy tylko pojawi
              się miejsce.
            </p>
            <button
              onClick={close}
              className="mt-6 rounded-full border border-ink/20 px-6 py-2.5 text-sm transition-colors hover:bg-ink/5"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
