"use client";

import { clsx } from "@/lib/clsx";

/** Zakładki w obrębie jednego widoku (np. wyjazd: dane / plan / uczestniczki). */
export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b border-ink/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors",
            tab.id === active
              ? "border-sage text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          )}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="rounded-full bg-blush/40 px-1.5 py-0.5 text-[0.65rem] font-medium">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
