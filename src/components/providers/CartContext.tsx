"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addCartItem,
  createCart,
  getCart,
  refreshCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart";
import { ApiError, ApiUnavailableError } from "@/lib/api/client";
import type { CartDto, PaymentModeDto } from "@/lib/api/types";
import { isSoldOut, spotsLeft, type Trip } from "@/lib/data/trips";

export type PaymentMode = PaymentModeDto;

/** Pozycja koszyka w postaci, której potrzebuje UI. */
export interface CartLine {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  seats: number;
  mode: PaymentMode;
  unitPrice: number;
  depositPerSeat: number;
  amountDueNow: number;
  tripTotal: number;
  /** Ile miejsc można jeszcze dołożyć do tej pozycji. */
  seatsAvailable: number;
  /** Czy miejsca są wciąż zablokowane dla tego koszyka. */
  holdActive: boolean;
  holdExpiresAt: string | null;
}

interface CartContextValue {
  cartId: string | null;
  items: CartLine[];
  count: number;
  totalDueNow: number;
  totalTripValue: number;
  holdExpiresAt: string | null;
  /** Czy koszyk jest obsługiwany przez API (a więc miejsca są naprawdę zablokowane). */
  online: boolean;
  busy: boolean;
  error: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  clearError: () => void;
  addTrip: (trip: Trip, mode?: PaymentMode, seats?: number) => Promise<void>;
  setSeats: (line: CartLine, seats: number) => Promise<void>;
  setMode: (line: CartLine, mode: PaymentMode) => Promise<void>;
  remove: (line: CartLine) => Promise<void>;
  refresh: () => Promise<void>;
  /** Po złożeniu zamówienia koszyk zaczyna się od nowa. */
  reset: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = "czula-podroz-cart-id";
const OFFLINE_KEY = "czula-podroz-cart-offline";

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* tryb prywatny — trudno, koszyk przeżyje tylko tę sesję */
  }
}

function toLines(cart: CartDto): CartLine[] {
  return cart.items.map((item) => ({
    id: item.id,
    slug: item.tripSlug,
    title: item.tripTitle,
    coverImage: item.coverImage,
    seats: item.seats,
    mode: item.paymentMode,
    unitPrice: item.unitPrice,
    depositPerSeat: item.depositPerSeat,
    amountDueNow: item.amountDueNow,
    tripTotal: item.tripTotal,
    seatsAvailable: item.seatsAvailable,
    holdActive: item.holdActive,
    holdExpiresAt: item.holdExpiresAt,
  }));
}

/** Pozycja liczona lokalnie, gdy API jest nieosiągalne. */
function offlineLine(trip: Trip, mode: PaymentMode, seats: number): CartLine {
  const unit = mode === "FULL" ? trip.price : trip.deposit;
  return {
    id: trip.slug,
    slug: trip.slug,
    title: trip.title,
    coverImage: trip.coverImage,
    seats,
    mode,
    unitPrice: trip.price,
    depositPerSeat: trip.deposit,
    amountDueNow: unit * seats,
    tripTotal: trip.price * seats,
    seatsAvailable: spotsLeft(trip),
    holdActive: false,
    holdExpiresAt: null,
  };
}

/**
 * Koszyk „Mój wyjazd".
 *
 * Koszyk mieszka po stronie API — dodanie wyjazdu naprawdę blokuje miejsca,
 * więc stan musi pochodzić z serwera, a nie z `localStorage`. Przeglądarka
 * trzyma wyłącznie identyfikator koszyka.
 *
 * Gdy backend jest nieosiągalny, przechodzimy w tryb offline: pozycje liczymy
 * lokalnie, żeby strona dalej działała, ale `online === false` i UI mówi
 * wprost, że miejsca nie są jeszcze zarezerwowane.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartLine[]>([]);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useRef(false);
  /**
   * Liczba trwających zapisów do koszyka.
   *
   * Odświeżanie w tle (po otwarciu szuflady, co 30 s) nie może nadpisać stanu
   * zapisem, który właśnie leci — inaczej dodany przed chwilą wyjazd potrafi
   * zniknąć, bo wcześniejszy odczyt wrócił później.
   */
  const pendingWrites = useRef(0);

  const applyCart = useCallback((cart: CartDto) => {
    setCartId(cart.id);
    writeStored(CART_ID_KEY, cart.id);
    setItems(toLines(cart));
    setOnline(true);
  }, []);

  const goOffline = useCallback((updater: (lines: CartLine[]) => CartLine[]) => {
    setOnline(false);
    setItems((previous) => {
      const next = updater(previous);
      writeStored(OFFLINE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /** Identyfikator koszyka — tworzymy przy pierwszej potrzebie. */
  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartId) return cartId;
    const cart = await createCart();
    setCartId(cart.id);
    writeStored(CART_ID_KEY, cart.id);
    return cart.id;
  }, [cartId]);

  /**
   * Wykonuje operację na koszyku. Jeśli zapisany koszyk zniknął albo został
   * już zamieniony na zamówienie, zakłada nowy i próbuje raz jeszcze.
   */
  const withCart = useCallback(
    async (operation: (id: string) => Promise<CartDto>): Promise<void> => {
      pendingWrites.current += 1;
      setBusy(true);
      setError(null);
      try {
        const id = await ensureCart();
        try {
          applyCart(await operation(id));
        } catch (exception) {
          const stale =
            exception instanceof ApiError &&
            (exception.code === "cart.notFound" ||
              exception.code === "cart.notEditable");
          if (!stale) throw exception;

          writeStored(CART_ID_KEY, null);
          setCartId(null);
          const fresh = await createCart();
          setCartId(fresh.id);
          writeStored(CART_ID_KEY, fresh.id);
          applyCart(await operation(fresh.id));
        }
      } catch (exception) {
        if (exception instanceof ApiUnavailableError) {
          throw exception;
        }
        setError(
          exception instanceof ApiError
            ? exception.message
            : "Coś poszło nie tak. Spróbuj ponownie za chwilę."
        );
      } finally {
        pendingWrites.current -= 1;
        setBusy(false);
      }
    },
    [applyCart, ensureCart]
  );

  // Hydracja: odzyskujemy koszyk z API po identyfikatorze zapisanym w przeglądarce.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const storedId = readStored(CART_ID_KEY);
    if (!storedId) {
      const offline = readStored(OFFLINE_KEY);
      if (offline) {
        try {
          setItems(JSON.parse(offline) as CartLine[]);
          setOnline(false);
        } catch {
          writeStored(OFFLINE_KEY, null);
        }
      }
      return;
    }

    getCart(storedId)
      .then((cart) => {
        if (pendingWrites.current > 0) return;
        if (cart.status === "ACTIVE") {
          applyCart(cart);
        } else {
          // Koszyk poszedł już do zamówienia — zaczynamy od czystego.
          writeStored(CART_ID_KEY, null);
        }
      })
      .catch((exception) => {
        if (exception instanceof ApiUnavailableError) {
          setOnline(false);
          return;
        }
        writeStored(CART_ID_KEY, null);
        setCartId(null);
      });
  }, [applyCart]);

  const refresh = useCallback(async () => {
    if (!cartId || pendingWrites.current > 0) return;
    try {
      applyCart(await getCart(cartId));
    } catch (exception) {
      if (exception instanceof ApiUnavailableError) setOnline(false);
    }
  }, [applyCart, cartId]);

  // Przy otwarciu szuflady i co pół minuty odświeżamy dostępność miejsc,
  // żeby klientka widziała prawdę, a nie stan sprzed kwadransa.
  useEffect(() => {
    if (!isOpen || !cartId) return;
    void refresh();
    const interval = setInterval(() => void refresh(), 30_000);
    return () => clearInterval(interval);
  }, [isOpen, cartId, refresh]);

  const value = useMemo<CartContextValue>(() => {
    const addTrip: CartContextValue["addTrip"] = async (
      trip,
      mode = "DEPOSIT",
      seats = 1
    ) => {
      setIsOpen(true);
      try {
        await withCart((id) =>
          addCartItem(id, { tripSlug: trip.slug, seats, paymentMode: mode })
        );
      } catch {
        // API nieosiągalne — liczymy lokalnie i mówimy o tym w UI.
        if (isSoldOut(trip)) {
          setError("Na ten wyjazd nie ma już wolnych miejsc.");
          return;
        }
        goOffline((lines) =>
          lines.some((line) => line.slug === trip.slug)
            ? lines
            : [...lines, offlineLine(trip, mode, seats)]
        );
      }
    };

    const setSeats: CartContextValue["setSeats"] = async (line, seats) => {
      if (seats < 1) return;
      if (!online) {
        goOffline((lines) =>
          lines.map((current) =>
            current.id === line.id
              ? {
                  ...current,
                  seats,
                  amountDueNow:
                    (current.mode === "FULL"
                      ? current.unitPrice
                      : current.depositPerSeat) * seats,
                  tripTotal: current.unitPrice * seats,
                }
              : current
          )
        );
        return;
      }
      await withCart((id) =>
        updateCartItem(id, line.id, { seats, paymentMode: line.mode })
      );
    };

    const setMode: CartContextValue["setMode"] = async (line, mode) => {
      if (!online) {
        goOffline((lines) =>
          lines.map((current) =>
            current.id === line.id
              ? {
                  ...current,
                  mode,
                  amountDueNow:
                    (mode === "FULL"
                      ? current.unitPrice
                      : current.depositPerSeat) * current.seats,
                }
              : current
          )
        );
        return;
      }
      await withCart((id) =>
        updateCartItem(id, line.id, { seats: line.seats, paymentMode: mode })
      );
    };

    const remove: CartContextValue["remove"] = async (line) => {
      if (!online) {
        goOffline((lines) => lines.filter((current) => current.id !== line.id));
        return;
      }
      await withCart((id) => removeCartItem(id, line.id));
    };

    const reset = () => {
      writeStored(CART_ID_KEY, null);
      writeStored(OFFLINE_KEY, null);
      setCartId(null);
      setItems([]);
      setError(null);
    };

    const totalDueNow = items.reduce((sum, line) => sum + line.amountDueNow, 0);
    const totalTripValue = items.reduce((sum, line) => sum + line.tripTotal, 0);
    const holdExpiresAt =
      items
        .map((line) => line.holdExpiresAt)
        .filter((value): value is string => Boolean(value))
        .sort()[0] ?? null;

    return {
      cartId,
      items,
      count: items.length,
      totalDueNow,
      totalTripValue,
      holdExpiresAt,
      online,
      busy,
      error,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      clearError: () => setError(null),
      addTrip,
      setSeats,
      setMode,
      remove,
      refresh: async () => {
        if (!online) return;
        try {
          await withCart((id) => refreshCart(id));
        } catch {
          setOnline(false);
        }
      },
      reset,
    };
  }, [cartId, items, online, busy, error, isOpen, withCart, goOffline]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart musi być użyte wewnątrz <CartProvider>");
  return ctx;
}
