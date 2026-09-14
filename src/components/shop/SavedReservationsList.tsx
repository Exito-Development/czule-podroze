"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MixedTitle from "@/components/ui/MixedTitle";
import { listSavedReservations, type SavedReservation } from "@/lib/reservations";

/** Rezerwacje zapisane w tej przeglądarce — skrót zamiast szukania maila. */
export default function SavedReservationsList() {
  const [reservations, setReservations] = useState<SavedReservation[] | null>(
    null
  );

  useEffect(() => {
    setReservations(listSavedReservations());
  }, []);

  if (reservations === null) {
    return <p className="text-center text-sm text-ink-soft">Wczytujemy…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-center text-4xl md:text-5xl">
        <MixedTitle text="Moje ~rezerwacje" />
      </h1>

      {reservations.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-ink-soft">
            Na tym urządzeniu nie ma zapisanych rezerwacji. Link do swojej
            rezerwacji znajdziesz w mailu z potwierdzeniem.
          </p>
          <Link
            href="/#destynacje"
            className="mt-8 inline-flex rounded-full bg-sage px-8 py-4 text-ivory transition-colors hover:bg-sage-dark"
          >
            Zobacz wyjazdy
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {reservations.map((reservation) => (
            <li key={reservation.orderNumber}>
              <Link
                href={`/rezerwacja/${reservation.orderNumber}?token=${encodeURIComponent(
                  reservation.accessToken
                )}`}
                className="flex items-center justify-between rounded-2xl bg-cream/70 px-6 py-5 transition-colors hover:bg-cream"
              >
                <span>
                  <span className="block font-serif text-lg">
                    {reservation.title || "Rezerwacja"}
                  </span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-ink-soft">
                    {reservation.orderNumber}
                  </span>
                </span>
                <span className="text-sage-dark">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
