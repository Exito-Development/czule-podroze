"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToTop } from "@/lib/scroll";

/** Po tylu ms odsłaniamy stronę nawet, gdy nawigacja się nie powiodła. */
const SAFETY_MS = 2500;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Przejście między stronami — „kurtyna podróży".
 *
 * Klik w wewnętrzny link jest przechwytywany: najpierw z dołu wjeżdża pełna
 * kurtyna (opcjonalnie ze zdjęciem i nazwą wyjazdu, jeśli link je poda przez
 * `data-transition-*`), dopiero potem następuje nawigacja. Po wyrenderowaniu
 * nowej strony kurtyna odjeżdża w górę, odsłaniając treść.
 *
 * Linki mogą sterować kurtyną atrybutami:
 *   data-transition-title="Tajlandia & Bali"
 *   data-transition-image="https://…"
 *   data-transition-eyebrow="Azja · 15 dni"
 */
export default function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();

  const panelRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);

  /** Czy kurtyna zasłania ekran i czeka na nową stronę. */
  const coveringRef = useRef(false);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRenderRef = useRef(true);

  const reveal = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || !coveringRef.current) return;

    coveringRef.current = false;
    if (safetyRef.current) clearTimeout(safetyRef.current);

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(panel, { autoAlpha: 0, yPercent: 100, y: 0 });
          ScrollTrigger.refresh();
        },
      })
      .to(captionRef.current, { opacity: 0, duration: 0.2, ease: "power1.in" })
      .to(
        panel,
        { yPercent: -100, duration: 0.65, ease: "power3.inOut" },
        "<0.05"
      );
  }, []);

  const cover = useCallback(
    (href: string, link: HTMLAnchorElement) => {
      const panel = panelRef.current;
      if (!panel) {
        router.push(href);
        return;
      }

      const title = link.dataset.transitionTitle ?? "";
      const eyebrow = link.dataset.transitionEyebrow ?? "";
      const image = link.dataset.transitionImage ?? "";

      if (titleRef.current) titleRef.current.textContent = title;
      if (eyebrowRef.current) eyebrowRef.current.textContent = eyebrow;
      if (imageRef.current) {
        imageRef.current.src = image;
        imageRef.current.style.opacity = image ? "0.35" : "0";
      }

      coveringRef.current = true;
      safetyRef.current = setTimeout(reveal, SAFETY_MS);

      gsap
        .timeline()
        .set(panel, { autoAlpha: 1, yPercent: 100, y: 0 })
        .set(captionRef.current, { opacity: 0, y: 18 })
        .to(panel, { yPercent: 0, duration: 0.55, ease: "power3.inOut" })
        .to(
          captionRef.current,
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
          "-=0.25"
        )
        .add(() => router.push(href));
    },
    [reveal, router]
  );

  // Przechwytywanie kliknięć w wewnętrzne linki.
  //
  // Słuchamy w fazie PRZECHWYTYWANIA na `document`: React (a więc i onClick
  // z <Link>) odbiera zdarzenia w fazie bąbelkowania, więc listener bąbelkowy
  // dostałby zdarzenie już z `defaultPrevented` — po tym, jak Next zdążył
  // przenieść stronę bez animacji.
  //
  // Zatrzymujemy tylko domyślną akcję, bez `stopPropagation`. <Link> pomija
  // własną nawigację, gdy zdarzenie ma `defaultPrevented`, a własne `onClick`
  // linków (np. zamknięcie koszyka) wciąż się wykonują.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("/#")) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      const target = `${url.pathname}${url.search}${url.hash}`;

      if (prefersReducedMotion()) {
        router.push(target);
        return;
      }
      cover(target, link as HTMLAnchorElement);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [cover, router]);

  // Nowa strona jest już wyrenderowana — odsłaniamy ją.
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    scrollToTop();
    reveal();
  }, [pathname, reveal]);

  useEffect(() => {
    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-sage-dark"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-sage-dark/40" />

      <div ref={captionRef} className="relative text-center text-ivory">
        <p
          ref={eyebrowRef}
          className="text-xs uppercase tracking-[0.35em] text-ivory/70"
        />
        <p ref={titleRef} className="mt-3 font-serif text-4xl md:text-5xl" />
        <p className="mt-4 font-script text-2xl text-blush-soft">
          czuła podróż
        </p>
      </div>
    </div>
  );
}
