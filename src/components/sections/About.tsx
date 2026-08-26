import Reveal from "@/components/anim/Reveal";
import MixedTitle from "@/components/ui/MixedTitle";

/** Prezentacja ogólna firmy — czym się zajmujemy. */
export default function About() {
  return (
    <section id="o-nas" className="section-pad section-y bg-ivory">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">
            Czuła Podróż
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
            <MixedTitle text="Wyjazdy, które są ~czymś_więcej niż *wakacje" />
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Organizujemy kameralne wyjazdy psychologiczno-seksuologiczne dla
            kobiet, które chcą połączyć podróż z pracą nad sobą. Autorskie
            warsztaty prowadzone przez psycholożki, codzienny ruch, lokalna
            kultura i grupa, w której naprawdę można być sobą. To podróż w
            piękne miejsce — i do siebie.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
