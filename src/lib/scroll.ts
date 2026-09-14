/**
 * Przewinięcie do sekcji z uwzględnieniem Lenisa (płynny scroll).
 * Gdy Lenis jest wyłączony (np. `prefers-reduced-motion`), używamy natywnego API.
 */
type LenisLike = {
  scrollTo: (
    target: HTMLElement | number,
    options?: { offset?: number; immediate?: boolean }
  ) => void;
};

function getLenis(): LenisLike | undefined {
  return (window as unknown as { lenis?: LenisLike }).lenis;
}

export function scrollToId(id: string, offset = -80): void {
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset });
    return;
  }
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
}

export function scrollToTop(immediate = true): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate });
    return;
  }
  window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}
