import Link from "next/link";

/** Nagłówek widoku: gdzie jestem, co tu robię, co mogę zrobić. */
export default function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-1 inline-block text-sm text-ink-soft transition-colors hover:text-ink"
          >
            ← {backLabel ?? "Wróć"}
          </Link>
        )}
        <h1 className="font-serif text-2xl md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
