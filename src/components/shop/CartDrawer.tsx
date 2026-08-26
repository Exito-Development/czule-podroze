"use client";

import { useCart } from "@/components/providers/CartContext";
import { formatPrice } from "@/lib/data/trips";
import { clsx } from "@/lib/clsx";

/**
 * Szuflada "Mój wyjazd" — koszyk sklepu.
 * Płatność (zadatek / całość) podłączymy do backendu (Spring Boot) później;
 * przycisk "Przejdź do płatności" jest na razie zaślepką.
 */
export default function CartDrawer() {
  const { items, isOpen, close, remove, setMode, total } = useCart();

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
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h3 className="font-serif text-xl">Mój wyjazd</h3>
          <button
            onClick={close}
            aria-label="Zamknij"
            className="text-xl text-ink/60 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-soft">
              Twój koszyk jest pusty.
              <br />
              Wybierz wyjazd i kliknij „Chcę jechać!”.
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex gap-4 rounded-2xl bg-cream/70 p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-serif text-base">{item.title}</h4>
                      <button
                        onClick={() => remove(item.slug)}
                        aria-label="Usuń"
                        className="text-sm text-ink/40 hover:text-ink"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-2 flex gap-1 rounded-full bg-ivory p-1 text-xs">
                      <button
                        onClick={() => setMode(item.slug, "deposit")}
                        className={clsx(
                          "flex-1 rounded-full px-2 py-1 transition-colors",
                          item.mode === "deposit"
                            ? "bg-sage text-ivory"
                            : "text-ink-soft"
                        )}
                      >
                        Zadatek
                      </button>
                      <button
                        onClick={() => setMode(item.slug, "full")}
                        className={clsx(
                          "flex-1 rounded-full px-2 py-1 transition-colors",
                          item.mode === "full"
                            ? "bg-sage text-ivory"
                            : "text-ink-soft"
                        )}
                      >
                        Całość
                      </button>
                    </div>

                    <p className="mt-2 text-sm font-medium">
                      {formatPrice(
                        item.mode === "full" ? item.price : item.deposit
                      )}
                      {item.mode === "deposit" && (
                        <span className="ml-1 text-xs text-ink-soft">
                          (z {formatPrice(item.price)})
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-5">
            <div className="flex items-center justify-between text-base">
              <span className="text-ink-soft">Do zapłaty teraz</span>
              <span className="font-serif text-xl">{formatPrice(total)}</span>
            </div>
            <button
              className="mt-4 w-full rounded-full bg-sage py-4 text-ivory transition-colors hover:bg-sage-dark"
              onClick={() =>
                alert(
                  "Płatność zostanie podłączona do backendu (Spring Boot) na kolejnym etapie."
                )
              }
            >
              Przejdź do płatności
            </button>
            <p className="mt-3 text-center text-xs text-ink-soft">
              Płatności obsłuży operator (np. Przelewy24 / Stripe) po stronie
              backendu.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
