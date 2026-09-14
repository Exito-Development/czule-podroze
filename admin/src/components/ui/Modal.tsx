"use client";

import { useEffect } from "react";

/**
 * Okno dialogowe.
 *
 * Zamyka się Escapem i kliknięciem w tło, a na czas otwarcia blokuje
 * przewijanie strony pod spodem.
 */
export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-surface shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
          <h2 className="font-serif text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="text-ink-faint transition-colors hover:text-ink"
          >
            ✕
          </button>
        </header>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-3 border-t border-ink/8 px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
