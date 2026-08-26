"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/data/site";
import { useCart } from "@/components/providers/CartContext";
import { clsx } from "@/lib/clsx";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();
  const pathname = usePathname();

  // Strony z ciemnym hero u góry — tam nagłówek startuje w wariancie jasnym.
  const hasDarkHero = pathname === "/" || pathname.startsWith("/wyjazdy/");
  // Jasny wariant (biały tekst) tylko gdy jesteśmy nad ciemnym hero i nie przewinęliśmy.
  const light = hasDarkHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-ivory/85 shadow-sm shadow-ink/5 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="section-pad flex items-center justify-between py-4">
        <Link href="/" className="flex flex-col leading-none">
          <span
            className={clsx(
              "font-serif text-xl uppercase tracking-[0.2em] transition-colors",
              light ? "text-ivory" : "text-ink"
            )}
          >
            Czuła
          </span>
          <span className="-mt-1 font-script text-2xl text-blush">podróż</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-sm tracking-wide transition-colors",
                light
                  ? "text-ivory/90 hover:text-ivory"
                  : "text-ink/80 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={open}
            className={clsx(
              "relative hidden rounded-full border px-5 py-2.5 text-sm transition-colors sm:inline-flex",
              light
                ? "border-ivory/40 text-ivory hover:bg-ivory/10"
                : "border-ink/20 text-ink hover:bg-ink/5"
            )}
          >
            Mój wyjazd
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blush text-xs text-ink">
                {count}
              </span>
            )}
          </button>

          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-full border lg:hidden",
              light ? "border-ivory/40 text-ivory" : "border-ink/20 text-ink"
            )}
          >
            <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Menu mobilne */}
      {menuOpen && (
        <div className="section-pad border-t border-ink/10 bg-ivory/95 pb-6 pt-2 backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-base text-ink/80"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                open();
              }}
              className="mt-2 rounded-full bg-sage px-5 py-3 text-sm text-ivory"
            >
              Mój wyjazd ({count})
            </button>
          </nav>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 block text-sm text-ink/60"
          >
            {site.email}
          </a>
        </div>
      )}
    </header>
  );
}
