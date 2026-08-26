import { marqueeItems } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";

/**
 * Przewijający się pasek z hasłami (jak na CoParadiso). Treść w `marqueeItems`
 * — na razie poglądowa, do doprecyzowania przez klientki.
 *
 * Pętla: renderujemy listę dwa razy i przesuwamy o -50%, dzięki czemu
 * przejście jest bezszwowe. Pauza po najechaniu kursorem.
 */
export default function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <div className="group overflow-hidden bg-sage py-4 text-ivory">
      <div className="marquee-track flex w-max items-center gap-12 group-hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-3 text-sm uppercase tracking-[0.18em]"
          >
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
            <span aria-hidden className="text-ivory/50">
              ✺
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
