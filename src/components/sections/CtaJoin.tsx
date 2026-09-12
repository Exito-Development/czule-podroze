"use client";

import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/components/providers/CartContext";
import ParallaxImg from "@/components/anim/ParallaxImg";

/**
 * "Chcę jechać!" — tekst po lewej, tło z palmami/morzem.
 *
 * Sekcja kończy stronę pełnym kadrem (bez zaokrągleń, które zostawiały
 * pasek pustego tła) i działa jak kurtyna: przy przewijaniu wyjeżdża w górę,
 * odsłaniając stopkę czekającą pod spodem (patrz <FooterReveal />).
 */
export default function CtaJoin() {
  const { open } = useCart();

  return (
    <section className="section-pad relative overflow-hidden py-24 md:py-32">
      {/* Tło z paralaksą — palmy i morze */}
      <ParallaxImg src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/35 to-ink/10" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-lg text-ivory">
          <p className="text-sm uppercase tracking-[0.3em] text-ivory/80">
            Zarezerwuj miejsce
          </p>
          <h2 className="mt-4 text-5xl leading-tight md:text-6xl">
            <span className="font-serif">Chcę </span>
            <span className="font-display text-blush-soft">jechać!</span>
          </h2>
          <p className="mt-5 text-lg text-ivory/90">
            Zarezerwuj swoje miejsce już teraz i dołącz do naszej przygody.
            Liczba miejsc jest ograniczona — kameralnie i z czułością.
          </p>
          <button
            onClick={open}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ivory px-8 py-4 text-base font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            Zarezerwuj miejsce
            <Icon name="dolphin" className="h-6 w-6 text-sage" />
          </button>
        </div>
      </div>
    </section>
  );
}
