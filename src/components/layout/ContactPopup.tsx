"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/data/site";
import { clsx } from "@/lib/clsx";

/**
 * Pływający przycisk "Masz pytania?" — po kliknięciu rozwija
 * dymek z kontaktem (telefon / e-mail). Pojawia się po przewinięciu.
 */
export default function ContactPopup() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setMounted(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={clsx(
        "fixed bottom-5 right-5 z-[75] flex flex-col items-end gap-3 transition-all duration-500",
        mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
    >
      {open && (
        <div className="w-64 rounded-2xl border border-ink/10 bg-ivory p-5 shadow-xl">
          <p className="font-serif text-lg">Masz pytania?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Napisz lub zadzwoń — chętnie pomożemy zaplanować Twoją podróż.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href={`mailto:${site.email}`}
              className="block rounded-full bg-cream px-4 py-2 hover:bg-sand"
            >
              ✉ {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="block rounded-full bg-cream px-4 py-2 hover:bg-sand"
            >
              ☎ {site.phone}
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-ivory shadow-lg transition-transform hover:scale-105"
        aria-label="Masz pytania?"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
