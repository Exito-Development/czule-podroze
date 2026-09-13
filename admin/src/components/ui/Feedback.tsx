"use client";

import { clsx } from "@/lib/clsx";

/** Komunikat o błędzie lub powodzeniu operacji. */
export function Alert({
  tone = "error",
  children,
  onDismiss,
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  const tones = {
    error: "bg-danger-pale text-danger",
    success: "bg-sage/15 text-sage-dark",
    info: "bg-sage-pale text-ink-soft",
  };

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm",
        tones[tone]
      )}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Zamknij komunikat"
          className="opacity-60 transition-opacity hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function Loading({ label = "Wczytujemy…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-ink-soft">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-sage border-t-transparent"
      />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-serif text-lg">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
