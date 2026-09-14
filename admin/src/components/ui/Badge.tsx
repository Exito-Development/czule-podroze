import { clsx } from "@/lib/clsx";

export type Tone = "neutral" | "positive" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/8 text-ink-soft",
  positive: "bg-sage/20 text-sage-dark",
  warning: "bg-blush/35 text-ink",
  danger: "bg-danger-pale text-danger",
  info: "bg-sage-pale text-sage-dark",
};

export default function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Etykiety i kolory statusów — jedno miejsce dla całego panelu. */
export const tripStatus: Record<string, { label: string; tone: Tone }> = {
  open: { label: "Wolne miejsca", tone: "positive" },
  "few-left": { label: "Ostatnie miejsca", tone: "warning" },
  soldout: { label: "Brak miejsc", tone: "neutral" },
  upcoming: { label: "Nieopublikowany", tone: "info" },
};

export const orderStatus: Record<string, { label: string; tone: Tone }> = {
  PENDING_PAYMENT: { label: "Czeka na płatność", tone: "warning" },
  CONFIRMED: { label: "Opłacone", tone: "positive" },
  CANCELLED: { label: "Anulowane", tone: "neutral" },
  EXPIRED: { label: "Wygasłe", tone: "neutral" },
};

export const participantStatus: Record<string, { label: string; tone: Tone }> = {
  CONFIRMED: { label: "Jedzie", tone: "positive" },
  CANCELLED: { label: "Rezygnacja", tone: "neutral" },
};

export const deliveryStatus: Record<string, { label: string; tone: Tone }> = {
  SENT: { label: "Dostarczone", tone: "positive" },
  FAILED: { label: "Błąd", tone: "danger" },
};
