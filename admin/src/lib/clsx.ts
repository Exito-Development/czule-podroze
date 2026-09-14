/** Minimalny helper do warunkowego łączenia klas. */
export function clsx(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(" ");
}
