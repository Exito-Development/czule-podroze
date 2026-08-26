import { clsx } from "@/lib/clsx";

/**
 * Nagłówek z „mieszanych czcionek" — trend typograficzny, w którym słowa
 * jednego tytułu przeplatają różne kroje (serif / retro display / odręczny).
 *
 * Składnia tekstu: słowa oznaczone prefiksem zmieniają krój:
 *   "*słowo"  -> font-display (pulchny retro, domyślnie kolor sage)
 *   "~słowo"  -> font-script (odręczny, domyślnie kolor blush)
 *   reszta    -> font-serif
 * Podkreślenia łączą słowa w jeden segment: "*czułą_podróż".
 */
export default function MixedTitle({
  text,
  className,
  displayClass = "font-display text-sage-dark",
  scriptClass = "font-script text-blush",
}: {
  text: string;
  className?: string;
  /** Klasy dla słów "*..." (np. inny kolor na ciemnym tle). */
  displayClass?: string;
  /** Klasy dla słów "~...". */
  scriptClass?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((raw, i) => {
        const isDisplay = raw.startsWith("*");
        const isScript = raw.startsWith("~");
        const word = raw.replace(/^[*~]/, "").replace(/_/g, " ");
        return (
          <span
            key={i}
            className={clsx(
              isDisplay && displayClass,
              isScript && scriptClass,
              !isDisplay && !isScript && "font-serif"
            )}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}
