"use client";

import Link from "next/link";
import { useCart, type CartLine } from "@/components/providers/CartContext";
import HoldCountdown from "@/components/shop/HoldCountdown";
import { formatPrice } from "@/lib/data/trips";
import { clsx } from "@/lib/clsx";

/**
 * Szuflada „Mój wyjazd".
 *
 * Pokazuje stan koszyka prosto z API: ile miejsc jeszcze zostało, jak długo
 * są dla nas trzymane i ile wynosi kwota do zapłaty teraz. Dane odświeżają się
 * po otwarciu szuflady i cyklicznie, więc nie da się przejść do płatności
 * w przekonaniu, że miejsce wciąż czeka.
 */
export default function CartDrawer() {
  const {
    items,
    isOpen,
    close,
    remove,
    setMode,
    setSeats,
    totalDueNow,
    totalTripValue,
    holdExpiresAt,
    online,
    busy,
    error,
    clearError,
  } = useCart();

  const balance = totalTripValue - totalDueNow;

  return (
    <>
      <div
        onClick={close}
        className={clsx(
          "fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={clsx(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!isOpen}
        aria-label="Koszyk"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <h3 className="font-serif text-xl">Mój wyjazd</h3>
            {holdExpiresAt && online && (
              <HoldCountdown
                expiresAt={holdExpiresAt}
                className="text-xs text-ink-soft"
              />
            )}
          </div>
          <button
            onClick={close}
            aria-label="Zamknij"
            className="text-xl text-ink/60 transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-blush/25 px-4 py-3 text-sm text-ink">
            <div className="flex items-start justify-between gap-3">
              <p>{error}</p>
              <button
                onClick={clearError}
                aria-label="Zamknij komunikat"
                className="text-ink/50 hover:text-ink"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!online && items.length > 0 && (
          <p className="mx-6 mt-4 rounded-2xl bg-ecru/50 px-4 py-3 text-xs leading-relaxed text-ink-soft">
            Nie mamy teraz połączenia z systemem rezerwacji — miejsca nie są
            jeszcze dla Ciebie zablokowane. Zajrzyj za chwilę albo napisz do nas.
          </p>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-soft">
              {busy ? (
                "Rezerwujemy dla Ciebie miejsce…"
              ) : (
                <>
                  Twój koszyk jest pusty.
                  <br />
                  Wybierz wyjazd i kliknij „Chcę jechać!”.
                </>
              )}
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((line) => (
                <CartRow
                  key={line.id}
                  line={line}
                  online={online}
                  busy={busy}
                  onRemove={() => void remove(line)}
                  onMode={(mode) => void setMode(line, mode)}
                  onSeats={(seats) => void setSeats(line, seats)}
                />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-5">
            <div className="flex items-center justify-between text-base">
              <span className="text-ink-soft">Do zapłaty teraz</span>
              <span className="font-serif text-xl">
                {formatPrice(totalDueNow)}
              </span>
            </div>
            {balance > 0 && (
              <p className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                <span>Dopłata przed wyjazdem</span>
                <span>{formatPrice(balance)}</span>
              </p>
            )}

            <Link
              href="/zamowienie"
              onClick={close}
              className={clsx(
                "mt-4 block w-full rounded-full bg-sage py-4 text-center text-ivory transition-colors hover:bg-sage-dark",
                busy && "pointer-events-none opacity-60"
              )}
            >
              Przejdź do rezerwacji
            </Link>
            <p className="mt-3 text-center text-xs text-ink-soft">
              Rezerwujesz zadatkiem lub całą kwotą — resztę dopłacasz przed
              wyjazdem.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function CartRow({
  line,
  online,
  busy,
  onRemove,
  onMode,
  onSeats,
}: {
  line: CartLine;
  online: boolean;
  busy: boolean;
  onRemove: () => void;
  onMode: (mode: CartLine["mode"]) => void;
  onSeats: (seats: number) => void;
}) {
  const maxSeats = line.seats + line.seatsAvailable;

  return (
    <li className="flex gap-4 rounded-2xl bg-cream/70 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={line.coverImage}
        alt=""
        aria-hidden
        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <Link
            href={`/wyjazdy/${line.slug}`}
            className="font-serif text-base hover:underline"
          >
            {line.title}
          </Link>
          <button
            onClick={onRemove}
            disabled={busy}
            aria-label={`Usuń ${line.title} z koszyka`}
            className="text-sm text-ink/40 transition-colors hover:text-ink disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="mt-2 flex gap-1 rounded-full bg-ivory p-1 text-xs">
          <button
            onClick={() => onMode("DEPOSIT")}
            disabled={busy}
            className={clsx(
              "flex-1 rounded-full px-2 py-1 transition-colors",
              line.mode === "DEPOSIT" ? "bg-sage text-ivory" : "text-ink-soft"
            )}
          >
            Zadatek
          </button>
          <button
            onClick={() => onMode("FULL")}
            disabled={busy}
            className={clsx(
              "flex-1 rounded-full px-2 py-1 transition-colors",
              line.mode === "FULL" ? "bg-sage text-ivory" : "text-ink-soft"
            )}
          >
            Całość
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => onSeats(line.seats - 1)}
              disabled={busy || line.seats <= 1}
              aria-label="Mniej miejsc"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink/5 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-12 text-center tabular-nums">
              {line.seats} {line.seats === 1 ? "os." : "os."}
            </span>
            <button
              onClick={() => onSeats(line.seats + 1)}
              disabled={busy || (online && line.seatsAvailable < 1)}
              aria-label="Więcej miejsc"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink/5 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <p className="text-sm font-medium">{formatPrice(line.amountDueNow)}</p>
        </div>

        {online && (
          <p className="mt-2 text-[0.7rem] leading-snug text-ink-soft">
            {line.holdActive ? (
              <>
                Miejsca zablokowane dla Ciebie
                {line.holdExpiresAt && (
                  <>
                    {" · "}
                    <HoldCountdown expiresAt={line.holdExpiresAt} />
                  </>
                )}
              </>
            ) : (
              "Blokada wygasła — miejsca potwierdzimy przy rezerwacji"
            )}
            {line.seatsAvailable > 0 && maxSeats > line.seats && (
              <> · wolne jeszcze {line.seatsAvailable}</>
            )}
          </p>
        )}
      </div>
    </li>
  );
}
