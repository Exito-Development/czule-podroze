"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartContext";
import HoldCountdown from "@/components/shop/HoldCountdown";
import { ApiError, ApiUnavailableError } from "@/lib/api/client";
import { placeOrder, startPayment } from "@/lib/api/orders";
import { saveReservation } from "@/lib/reservations";
import { formatPrice } from "@/lib/data/trips";
import MixedTitle from "@/components/ui/MixedTitle";
import { clsx } from "@/lib/clsx";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string;
  acceptTerms: boolean;
}

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  note: "",
  acceptTerms: false,
};

/**
 * Kasa — ostatni krok przed płatnością.
 *
 * Zaraz po wejściu odświeżamy blokady miejsc: między dodaniem do koszyka
 * a tym ekranem mogło minąć sporo czasu. Jeśli miejsc już nie ma, klientka
 * dowiaduje się teraz, a nie po wypełnieniu całego formularza.
 */
export default function CheckoutView() {
  const {
    cartId,
    items,
    totalDueNow,
    totalTripValue,
    holdExpiresAt,
    online,
    refresh,
    reset,
  } = useCart();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const refreshed = useRef(false);

  useEffect(() => {
    if (refreshed.current) return;
    refreshed.current = true;
    void refresh();
  }, [refresh]);

  const balance = totalTripValue - totalDueNow;
  const canSubmit =
    items.length > 0 &&
    online &&
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.acceptTerms &&
    !submitting;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProblem(null);
    setSubmitting(true);

    if (!cartId) {
      setProblem("Twój koszyk wygasł. Wybierz wyjazd jeszcze raz.");
      setSubmitting(false);
      return;
    }

    try {
      const placed = await placeOrder({
        cartId,
        customer: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          note: form.note.trim() || undefined,
        },
        acceptTerms: form.acceptTerms,
      });

      // Token do podglądu rezerwacji API pokazuje tylko raz — zapisujemy go
      // zanim gdziekolwiek przejdziemy.
      saveReservation({
        orderNumber: placed.order.orderNumber,
        accessToken: placed.accessToken,
        title: placed.order.items.map((item) => item.tripTitle).join(", "),
        savedAt: new Date().toISOString(),
      });
      reset();

      const reservationPath = `/rezerwacja/${placed.order.orderNumber}?token=${encodeURIComponent(
        placed.accessToken
      )}`;

      try {
        const session = await startPayment({
          orderNumber: placed.order.orderNumber,
          accessToken: placed.accessToken,
        });
        window.location.href = session.redirectUrl;
      } catch {
        // Zamówienie już istnieje — nie zostawiamy klientki w ślepej uliczce,
        // tylko na stronie rezerwacji, gdzie płatność można ponowić.
        window.location.href = reservationPath;
      }
      return;
    } catch (exception) {
      if (exception instanceof ApiUnavailableError) {
        setProblem(
          "Nie udało się połączyć z systemem rezerwacji. Spróbuj za chwilę albo napisz do nas."
        );
      } else if (exception instanceof ApiError) {
        setProblem(exception.message);
      } else {
        setProblem("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl md:text-5xl">
          <MixedTitle text="Twój koszyk jest ~pusty" />
        </h1>
        <p className="mt-4 text-ink-soft">
          Wybierz wyjazd, a my zablokujemy dla Ciebie miejsce na czas rezerwacji.
        </p>
        <Link
          href="/#destynacje"
          className="mt-8 inline-flex rounded-full bg-sage px-8 py-4 text-ivory transition-colors hover:bg-sage-dark"
        >
          Zobacz wyjazdy
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
          Krok 2 z 3
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">
          <MixedTitle text="Rezerwuję swoje *miejsce" />
        </h1>
        {holdExpiresAt && online && (
          <HoldCountdown
            expiresAt={holdExpiresAt}
            className="mt-3 block text-sm text-ink-soft"
          />
        )}
      </div>

      {!online && (
        <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-blush/25 px-5 py-4 text-sm leading-relaxed text-ink">
          System rezerwacji jest chwilowo niedostępny, więc nie możemy teraz
          potwierdzić miejsca. Napisz do nas — zarezerwujemy je ręcznie.
        </p>
      )}

      {problem && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-blush/30 px-5 py-4 text-sm leading-relaxed text-ink">
          <p>{problem}</p>
          <Link
            href="/#destynacje"
            className="mt-2 inline-block underline underline-offset-4"
          >
            Wróć do oferty
          </Link>
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <form onSubmit={submit} className="lg:col-span-3">
          <h2 className="font-serif text-2xl">Twoje dane</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Imię"
              value={form.firstName}
              onChange={(value) => setForm({ ...form, firstName: value })}
              required
              autoComplete="given-name"
            />
            <Field
              label="Nazwisko"
              value={form.lastName}
              onChange={(value) => setForm({ ...form, lastName: value })}
              required
              autoComplete="family-name"
            />
            <Field
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              required
              autoComplete="email"
              hint="Tam wyślemy potwierdzenie i link do rezerwacji."
            />
            <Field
              label="Telefon"
              type="tel"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              autoComplete="tel"
            />
          </div>

          <label className="mt-4 block">
            <span className="text-sm text-ink-soft">
              Chcesz nam coś powiedzieć przed wyjazdem? (opcjonalnie)
            </span>
            <textarea
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              rows={3}
              className="mt-1 w-full rounded-2xl border border-ink/15 bg-cream/40 px-5 py-3 text-sm outline-none transition-colors focus:border-sage"
              placeholder="Dieta, alergie, jadę z koleżanką…"
            />
          </label>

          <label className="mt-6 flex items-start gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(event) =>
                setForm({ ...form, acceptTerms: event.target.checked })
              }
              className="mt-1 h-4 w-4 accent-[var(--color-sage)]"
              required
            />
            <span>
              Akceptuję{" "}
              <Link href="/regulamin" className="underline underline-offset-4">
                regulamin
              </Link>{" "}
              i wiem, że zadatek potwierdza rezerwację miejsca.
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className={clsx(
              "mt-8 w-full rounded-full bg-sage py-4 text-ivory transition-all",
              canSubmit ? "hover:bg-sage-dark" : "cursor-not-allowed opacity-50"
            )}
          >
            {submitting
              ? "Rezerwujemy miejsce…"
              : `Rezerwuję i płacę ${formatPrice(totalDueNow)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Za chwilę przeniesiemy Cię na stronę operatora płatności.
          </p>
        </form>

        <aside className="lg:col-span-2">
          <div className="rounded-3xl bg-cream/70 p-7">
            <h2 className="font-serif text-xl">Twoja rezerwacja</h2>
            <ul className="mt-5 space-y-4">
              {items.map((line) => (
                <li key={line.id} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.coverImage}
                    alt=""
                    aria-hidden
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-serif text-base">{line.title}</p>
                    <p className="text-ink-soft">
                      {line.seats} {line.seats === 1 ? "osoba" : "osoby"} ·{" "}
                      {line.mode === "FULL" ? "całość" : "zadatek"}
                    </p>
                    <p className="mt-1 font-medium">
                      {formatPrice(line.amountDueNow)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Wartość wyjazdów</dt>
                <dd>{formatPrice(totalTripValue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Do zapłaty teraz</dt>
                <dd className="font-serif text-lg">
                  {formatPrice(totalDueNow)}
                </dd>
              </div>
              {balance > 0 && (
                <div className="flex justify-between text-ink-soft">
                  <dt>Dopłata przed wyjazdem</dt>
                  <dd>{formatPrice(balance)}</dd>
                </div>
              )}
            </dl>
          </div>

          <Link
            href="/#destynacje"
            className="mt-4 block text-center text-sm text-ink-soft underline-offset-4 hover:underline"
          >
            ← Wróć do oferty
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-ink-soft">
        {label}
        {required && <span className="text-blush"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-full border border-ink/15 bg-cream/40 px-5 py-3 text-sm outline-none transition-colors focus:border-sage"
      />
      {hint && <span className="mt-1 block text-xs text-ink-soft/80">{hint}</span>}
    </label>
  );
}
