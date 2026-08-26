import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/anim/Reveal";

const partners = ["Partner podróży", "Hotele & resorty", "Linie lotnicze", "Ubezpieczenia"];

/** Sekcja social media + partnerzy. */
export default function Social() {
  return (
    <section className="section-pad section-y bg-ivory">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <h2 className="font-serif text-3xl md:text-4xl">
            Bądźmy w kontakcie
          </h2>
          <p className="mt-3 text-ink-soft">
            Śledź nasze podróże na Instagramie{" "}
            <span className="font-medium text-ink">@czulapodroz</span>
          </p>
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blush px-6 py-3 text-sm text-ink transition-transform hover:scale-[1.03]"
          >
            <Icon name="instagram" className="h-5 w-5" />
            Obserwuj nas
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 border-t border-ink/10 pt-10">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
              Zaufali nam / Partnerzy
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-ink/40">
              {partners.map((p) => (
                <span key={p} className="font-serif text-lg">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
