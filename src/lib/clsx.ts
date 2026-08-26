/** Minimalny helper do warunkowego łączenia klas (bez zależności). */
export function clsx(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(" ");
}
