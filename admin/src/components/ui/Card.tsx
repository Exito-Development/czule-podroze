import { clsx } from "@/lib/clsx";

/** Kafel treści — podstawowy budulec widoków panelu. */
export default function Card({
  title,
  description,
  action,
  padded = true,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Wyłącz, gdy w środku jest tabela na całą szerokość. */
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        "overflow-hidden rounded-2xl bg-surface ring-1 ring-ink/8",
        className
      )}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <div>
            {title && <h2 className="font-serif text-lg leading-tight">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={clsx(padded && "p-5")}>{children}</div>
    </section>
  );
}
