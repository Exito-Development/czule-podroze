"use client";

import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-sage text-white hover:bg-sage-dark disabled:bg-sage/50",
  secondary:
    "bg-white text-ink ring-1 ring-ink/15 hover:bg-cream disabled:text-ink-faint",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  /** Blokuje przycisk i pokazuje, że coś się dzieje. */
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
