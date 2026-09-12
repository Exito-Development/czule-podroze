"use client";

import {
  formatPrice,
  spotsLeft,
  type Trip,
} from "@/lib/data/trips";
import { useCart } from "@/components/providers/CartContext";
import { openWaitlist } from "@/components/shop/WaitlistModal";
import { Icon } from "@/components/ui/Icon";

/** Box rezerwacji na stronie wyjazdu — zadatek / całość / lista rezerwowa. */
export default function BookingBox({ trip }: { trip: Trip }) {
  const { addTrip } = useCart();
  const left = spotsLeft(trip);
  const soldout = trip.status === "soldout" || left === 0;

  return (
    <div className="rounded-3xl bg-cream/70 p-7 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-soft">Cena za osobę</p>
          <p className="font-serif text-3xl">{formatPrice(trip.price)}</p>
        </div>
        {!soldout && (
          <span className="rounded-full bg-blush/30 px-3 py-1 text-xs">
            {left} {left === 1 ? "miejsce" : "miejsc"}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        Rezerwacja możliwa zadatkiem {formatPrice(trip.deposit)} — resztę
        dopłacasz później.
      </p>

      {soldout ? (
        <button
          onClick={() => openWaitlist(trip)}
          className="mt-6 w-full rounded-full border border-ink/20 py-4 text-sm transition-colors hover:bg-ink/5"
        >
          Zapisz się na listę rezerwową
        </button>
      ) : (
        <div className="mt-6 space-y-3">
          <button
            onClick={() => void addTrip(trip, "DEPOSIT")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage py-4 text-ivory transition-colors hover:bg-sage-dark"
          >
            Chcę jechać! — zadatek
            <Icon name="dolphin" className="h-5 w-5" />
          </button>
          <button
            onClick={() => void addTrip(trip, "FULL")}
            className="w-full rounded-full border border-ink/20 py-3.5 text-sm transition-colors hover:bg-ink/5"
          >
            Zapłać całość ({formatPrice(trip.price)})
          </button>
        </div>
      )}
    </div>
  );
}
