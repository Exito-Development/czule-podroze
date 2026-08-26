"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Trip } from "@/lib/data/trips";

export type PaymentMode = "deposit" | "full";

export interface CartItem {
  slug: string;
  title: string;
  coverImage: string;
  /** Czy klientka płaci zadatek, czy całość. */
  mode: PaymentMode;
  price: number;
  deposit: number;
  /** Liczba miejsc (osób). */
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** "Chcę jechać!" — dodaje wyjazd do koszyka i otwiera szufladę. */
  addTrip: (trip: Trip, mode?: PaymentMode) => void;
  remove: (slug: string) => void;
  setMode: (slug: string, mode: PaymentMode) => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "czula-podroz-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Hydracja z localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addTrip: CartContextValue["addTrip"] = (trip, mode = "deposit") => {
      setItems((prev) => {
        if (prev.some((i) => i.slug === trip.slug)) return prev;
        return [
          ...prev,
          {
            slug: trip.slug,
            title: trip.title,
            coverImage: trip.coverImage,
            mode,
            price: trip.price,
            deposit: trip.deposit,
            quantity: 1,
          },
        ];
      });
      setIsOpen(true);
    };

    const total = items.reduce(
      (sum, i) => sum + (i.mode === "full" ? i.price : i.deposit) * i.quantity,
      0
    );

    return {
      items,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addTrip,
      remove: (slug) =>
        setItems((prev) => prev.filter((i) => i.slug !== slug)),
      setMode: (slug, mode) =>
        setItems((prev) =>
          prev.map((i) => (i.slug === slug ? { ...i, mode } : i))
        ),
      total,
      count: items.length,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart musi być użyte wewnątrz <CartProvider>");
  return ctx;
}
