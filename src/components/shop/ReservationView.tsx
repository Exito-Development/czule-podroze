"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError, ApiUnavailableError } from "@/lib/api/client";
import { getReservation, startPayment } from "@/lib/api/orders";
import type { ReservationDto } from "@/lib/api/types";
import { findSavedToken, saveReservation } from "@/lib/reservations";
import { formatDateRange, formatPrice } from "@/lib/data/trips";
import MixedTitle from "@/components/ui/MixedTitle";
import { Icon } from "@/components/ui/Icon";
import { clsx } from "@/lib/clsx";

const statusLabels: Record<
  ReservationDto["order"]["status"],
  { title: string; description: string; cls: string }
> = {
  PENDING_PAYMENT: {
    title: "Czekamy na płatność",
    description:
      "Miejsca są dla Ciebie zablokowane do czasu wskazanego niżej. Po zaksięgowaniu wpłaty rezerwacja jest potwierdzona.",
    cls: "bg-blush/25",
  },
  CONFIRMED: {
    title: "Rezerwacja potwierdzona",
    description: "Miejsce jest Twoje. Do zobaczenia w podróży!",
    cls: "bg-sage/15",
  },
  CANCELLED: {
    title: "Rezerwacja anulowana",
    description: "Jeśli to pomyłka, napisz do nas — poszukamy miejsca.",
    cls: "bg-ink/5",
  },
  EXPIRED: {
    title: "Rezerwacja wygasła",
    description:
      "Czas na opłacenie minął i miejsca wróciły do puli. Możesz zarezerwować je ponownie.",
    cls: "bg-ink/5",
  },
};

/**
 * „Moja rezerwacja" — miejsce, w którym klientka widzi wszystko o wyjeździe.
 *
 * Dostęp daje token z linku (`?token=`) albo ten sam token zapisany
 * w przeglądarce przy składaniu zamówienia.
 */
export default function ReservationView({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const searchParams = useSearchParams();
  const tokenFromLink = searchParams.get("token");
  const paymentResult = searchParams.get("platnosc");

  const [reservation, setReservation] = useState<ReservationDto | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    const token = tokenFromLink ?? findSavedToken(orderNumber);
    if (!token) {
      setProblem(
        "Ta rezerwacja wymaga linku z potwierdzenia — znajdziesz go w mailu od nas."
      );
      setLoading(false);
      return;
    }

    try {
      const data = await getReservation(orderNumber, token);
      setReservation(data);
      setProblem(null);
      // Link z maila otwarty na nowym urządzeniu — zapamiętujemy rezerwację.
      saveReservation({
        orderNumber,
        accessToken: token,
        title: data.order.items.map((item) => item.tripTitle).join(", "),
        savedAt: new Date().toISOString(),
      });
    } catch (exception) {
      if (exception instanceof ApiUnavailableError) {
        setProblem(
          "Nie udało się połączyć z systemem rezerwacji. Spróbuj odświeżyć stronę za chwilę."
        );
      } else if (exception instanceof ApiError) {
        setProblem(exception.message);
      } else {
        setProblem("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
      }
    } finally {
      setLoading(false);
    }
  }, [orderNumber, tokenFromLink]);

  useEffect(() => {
    void load();
  }, [load]);

  // Powrót z bramki płatniczej: księgowanie bywa o sekundę spóźnione.
  useEffect(() => {
    if (paymentResult !== "oplacone") return;
    const timeout = setTimeout(() => void load(), 1200);
    return () => clearTimeout(timeout);
  }, [paymentResult, load]);

  const payNow = async () => {
    const token = tokenFromLink ?? findSavedToken(orderNumber);
    if (!token) return;
    setPaying(true);
    try {
      const session = await startPayment({ orderNumber, accessToken: token });
      window.location.href = session.redirectUrl;
    } catch (exception) {
      setProblem(
        exception instanceof ApiError
          ? exception.message
          : "Nie udało się rozpocząć płatności. Spróbuj ponownie."
      );
      setPaying(false);
    }
  };

  const download = () => {
    if (!reservation) return;
    const blob = new Blob([toPlainText(reservation)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `czula-podroz-${reservation.order.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <p className="text-center text-sm text-ink-soft">Wczytujemy rezerwację…</p>;
  }

  if (!reservation) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl">
          <MixedTitle text="Nie znaleźliśmy tej ~rezerwacji" />
        </h1>
        <p className="mt-4 text-ink-soft">{problem}</p>
        <Link
          href="/#kontakt"
          className="mt-8 inline-flex rounded-full border border-ink/20 px-8 py-4 transition-colors hover:bg-ink/5"
        >
          Napisz do nas
        </Link>
      </div>
    );
  }

  const { order, trips } = reservation;
  const status = statusLabels[order.status];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
          Rezerwacja {order.orderNumber}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">
          <MixedTitle text="Moja ~podróż" />
        </h1>
      </div>

      <div className={clsx("mt-10 rounded-3xl p-7", status.cls)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">{status.title}</h2>
            <p className="mt-2 max-w-lg text-sm text-ink-soft">
              {status.description}
            </p>
          </div>
          {order.status === "PENDING_PAYMENT" && (
            <button
              onClick={payNow}
              disabled={paying}
              className="rounded-full bg-sage px-7 py-3.5 text-sm text-ivory transition-colors hover:bg-sage-dark disabled:opacity-60"
            >
              {paying ? "Otwieramy płatność…" : `Zapłać ${formatPrice(order.amountDueNow)}`}
            </button>
          )}
        </div>

        {order.status === "PENDING_PAYMENT" && (
          <p className="mt-4 text-xs text-ink-soft">
            Termin płatności:{" "}
            {new Intl.DateTimeFormat("pl-PL", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(order.paymentDeadline))}
          </p>
        )}
      </div>

      {problem && (
        <p className="mt-6 rounded-2xl bg-blush/30 px-5 py-4 text-sm text-ink">
          {problem}
        </p>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-5">
        <div className="rounded-3xl bg-cream/70 p-7 md:col-span-3">
          <h2 className="font-serif text-xl">Co rezerwujesz</h2>
          <ul className="mt-5 space-y-4">
            {order.items.map((item) => (
              <li key={item.tripSlug} className="border-b border-ink/10 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/wyjazdy/${item.tripSlug}`}
                      className="font-serif text-lg hover:underline"
                    >
                      {item.tripTitle}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      {item.seats} {item.seats === 1 ? "osoba" : "osoby"} ·{" "}
                      {item.paymentMode === "FULL"
                        ? "płatność całością"
                        : "zadatek"}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-medium">
                    {formatPrice(item.amountDueNow)}
                  </p>
                </div>
                {item.balanceDue > 0 && (
                  <p className="mt-1 text-xs text-ink-soft">
                    Do dopłaty przed wyjazdem: {formatPrice(item.balanceDue)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-sage/10 p-7 md:col-span-2">
          <h2 className="font-serif text-xl">Rozliczenie</h2>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Wartość wyjazdu</dt>
              <dd>{formatPrice(order.tripTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Wpłacono</dt>
              <dd>{formatPrice(order.amountPaid)}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Pozostaje</dt>
              <dd>{formatPrice(order.balanceDue)}</dd>
            </div>
          </dl>

          <button
            onClick={download}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 py-3 text-sm transition-colors hover:bg-ink/5"
          >
            Pobierz szczegóły
            <Icon name="sparkle" className="h-4 w-4 text-sage-dark" />
          </button>
        </div>
      </div>

      {trips.map((trip) => (
        <section key={trip.slug} className="mt-12">
          <h2 className="font-serif text-2xl">Plan: {trip.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {formatDateRange(trip.startDate, trip.endDate)} · {trip.country}
          </p>

          <ol className="relative mt-7 space-y-5 border-l border-ink/10 pl-7">
            {trip.itinerary.map((day) => (
              <li key={day.day} className="relative">
                <span className="absolute -left-[34px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sage text-[0.65rem] text-ivory">
                  {day.day}
                </span>
                <h3 className="font-serif text-lg">{day.title}</h3>
                <p className="text-sm text-ink-soft">{day.description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-3xl bg-cream/60 p-6">
            <h3 className="font-serif text-lg">W cenie</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {trip.included.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-soft">
                  <span className="text-sage-dark">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <div className="mt-12 text-center">
        <Link
          href="/#kontakt"
          className="text-sm text-ink-soft underline-offset-4 hover:underline"
        >
          Masz pytania? Napisz do nas
        </Link>
      </div>
    </div>
  );
}

/** Rezerwacja w postaci, którą da się wydrukować albo wysłać dalej. */
function toPlainText(reservation: ReservationDto): string {
  const { order, trips } = reservation;
  const lines: string[] = [
    "CZUŁA PODRÓŻ — potwierdzenie rezerwacji",
    "=".repeat(48),
    `Numer rezerwacji: ${order.orderNumber}`,
    `Status: ${order.status}`,
    `Osoba rezerwująca: ${order.customer.firstName} ${order.customer.lastName}`,
    `E-mail: ${order.customer.email}`,
    "",
    "ROZLICZENIE",
    `  Wartość wyjazdu: ${formatPrice(order.tripTotal)}`,
    `  Wpłacono: ${formatPrice(order.amountPaid)}`,
    `  Pozostaje: ${formatPrice(order.balanceDue)}`,
    "",
  ];

  for (const trip of trips) {
    lines.push(
      `WYJAZD: ${trip.title} (${trip.country})`,
      `  Termin: ${formatDateRange(trip.startDate, trip.endDate)}`,
      "",
      "  PLAN DZIEŃ PO DNIU",
      ...trip.itinerary.map(
        (day) => `   ${day.day}. ${day.title} — ${day.description}`
      ),
      "",
      "  W CENIE",
      ...trip.included.map((item) => `   • ${item}`),
      ""
    );
  }

  lines.push("Do zobaczenia w podróży!", "kontakt@czulapodroz.pl");
  return lines.join("\n");
}
