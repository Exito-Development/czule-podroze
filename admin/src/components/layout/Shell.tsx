"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loading } from "@/components/ui/Feedback";
import { clsx } from "@/lib/clsx";

const navigation = [
  { href: "/", label: "Pulpit", icon: "◈" },
  { href: "/wyjazdy", label: "Wyjazdy", icon: "✈" },
  { href: "/zamowienia", label: "Zamówienia", icon: "▤" },
  { href: "/wiadomosci", label: "Wiadomości", icon: "✉" },
  { href: "/lista-rezerwowa", label: "Lista rezerwowa", icon: "⏳" },
];

/**
 * Rama panelu: nawigacja po lewej, treść po prawej.
 *
 * Ekran logowania renderujemy bez ramy — nie ma jeszcze czego nawigować.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/logowanie") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Sprawdzamy sesję…" />
      </div>
    );
  }

  if (!user) {
    // Przekierowanie obsługuje AuthProvider — tu tylko nie migamy treścią.
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Nawigacja */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface ring-1 ring-ink/8 transition-transform lg:static lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-6">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-lg uppercase tracking-[0.2em]">
              Czuła
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-sage-dark">
              Panel
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sage/15 font-medium text-ink"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                )}
              >
                <span aria-hidden className="text-sage-dark">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink/8 px-5 py-4">
          <p className="truncate text-xs text-ink-soft">{user.email}</p>
          <button
            onClick={() => void signOut()}
            className="mt-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Treść */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-ink/8 bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-ink/15"
          >
            ☰
          </button>
          <span className="font-serif">Panel Czułej Podróży</span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
