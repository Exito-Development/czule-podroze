import { reasons } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/anim/Reveal";

/**
 * „Dlaczego warto?" — poziomy rząd ikon z krótkimi podpisami i pionowymi
 * separatorami. Po najechaniu na element pojawia się chmurka z pełnym opisem.
 * Na mobile (brak hovera) opis jest pokazany od razu pod podpisem.
 */
export default function WhyUs() {
  return (
    <section
      id="dlaczego-warto"
      className="section-pad section-y bg-sage-pale"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center font-serif text-3xl uppercase tracking-[0.15em] md:text-4xl">
            Dlaczego warto?
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-blush" />
        </Reveal>

        {/* Desktop: rząd z separatorami + chmurka na hover */}
        <Reveal delay={0.05}>
          <div className="mt-16 hidden divide-x divide-ink/10 md:flex md:items-start md:justify-center">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="group/item relative flex-1 px-6 text-center"
              >
                <div className="flex flex-col items-center">
                  <span className="text-sage-dark transition-transform duration-300 group-hover/item:-translate-y-1">
                    <Icon name={r.icon} className="h-9 w-9" />
                  </span>
                  <p className="mt-5 text-xs uppercase leading-relaxed tracking-[0.18em] text-ink-soft">
                    {r.title}
                  </p>
                </div>

                {/* Chmurka */}
                <div className="pointer-events-none absolute left-1/2 top-full z-20 w-60 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-hover/item:translate-y-0 group-hover/item:opacity-100">
                  <div className="relative rounded-2xl bg-ivory px-4 py-3 text-xs leading-relaxed text-ink-soft shadow-xl shadow-ink/10 ring-1 ring-ink/5">
                    <span
                      aria-hidden
                      className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-ivory ring-1 ring-ink/5"
                    />
                    <span className="relative">{r.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Mobile: ikona + podpis + opis od razu widoczny */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:hidden">
          {reasons.map((r) => (
            <div key={r.title} className="flex flex-col items-center text-center">
              <span className="text-sage-dark">
                <Icon name={r.icon} className="h-8 w-8" />
              </span>
              <p className="mt-3 text-xs uppercase leading-relaxed tracking-[0.18em] text-ink">
                {r.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
