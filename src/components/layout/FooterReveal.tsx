"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/layout/Footer";
import { clsx } from "@/lib/clsx";

/**
 * Stopka „wyjeżdżająca spod" ostatniej sekcji.
 *
 * Zamiast przewijać się razem z treścią, stopka stoi przyklejona do dołu okna
 * (pozycja `fixed`) i leży POD nieprzezroczystą treścią strony (z-10). Na końcu
 * dokumentu zostawiamy okno o dokładnie jej wysokości — kiedy sekcja „Chcę
 * jechać!" wyjeżdża w górę, spod niej stopniowo wynurza się stopka.
 *
 * Wysokość okna mierzymy `ResizeObserver`em (stopka jest responsywna), a tryb
 * `fixed` włączamy dopiero, gdy okno wjedzie w widok — dzięki temu stopka nigdy
 * nie miga nad hero na górze strony. Przed hydracją (i bez JS) stopka
 * renderuje się normalnie, w zwykłym przepływie dokumentu.
 */
export default function FooterReveal() {
  const windowRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const measure = () => setHeight(el.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRevealing(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ready = height > 0;

  return (
    <div
      ref={windowRef}
      className="relative"
      style={ready ? { height } : undefined}
    >
      <div
        ref={footerRef}
        className={clsx(
          "left-0 w-full",
          !ready
            ? "relative"
            : revealing
              ? "fixed bottom-0 z-0"
              : "absolute bottom-0"
        )}
      >
        <Footer />
      </div>
    </div>
  );
}
