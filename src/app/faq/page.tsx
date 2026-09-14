import type { Metadata } from "next";
import { faqItems } from "@/lib/data/faq";
import FooterReveal from "@/components/layout/FooterReveal";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ — pytania o wyjazdy dla kobiet",
  description:
    "Dla kogo są wyjazdy, jak wygląda rezerwacja i płatność, co jest w cenie, " +
    "czy można jechać samej — odpowiedzi na najczęstsze pytania o Czułą Podróż.",
  alternates: { canonical: "/faq" },
  openGraph: { url: "/faq" },
};

export default function FaqPage() {
  return (
    <main>
      {/* Pary pytanie–odpowiedź, które Google potrafi rozwinąć w wyniku. */}
      <JsonLd data={faqSchema(faqItems)} />
      <section className="section-pad relative z-10 bg-ivory pb-16 pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
            Pomoc
          </p>
          <h1 className="mt-3 font-serif text-5xl">Najczęstsze pytania</h1>

          <div className="mt-12 space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl bg-cream/60 px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between font-serif text-lg">
                  {item.question}
                  <span className="text-xl text-ink-soft transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <FooterReveal />
    </main>
  );
}
