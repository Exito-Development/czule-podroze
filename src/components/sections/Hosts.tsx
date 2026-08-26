import { hosts } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/anim/Reveal";
import MixedTitle from "@/components/ui/MixedTitle";

/** "Poznajmy się" — Wiki & Natka. Zdjęcia w kształcie lustra (arch). */
export default function Hosts() {
  return (
    <section className="section-pad section-y bg-blush-pale">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="text-center text-4xl md:text-5xl">
            <MixedTitle text="Poznajmy ~się" />
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
          {hosts.map((host, i) => (
            <Reveal key={host.name} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
                {/* Zdjęcie w kształcie lustra — zaokrąglone u góry i dołu */}
                <div className="h-48 w-36 flex-shrink-0 overflow-hidden rounded-t-full rounded-b-full bg-cream shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={host.image}
                    alt={host.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-5 sm:mt-0">
                  <h3 className="font-script text-3xl text-blush">
                    {host.name}
                  </h3>
                  <p className="text-sm uppercase tracking-[0.15em] text-sage-dark">
                    {host.role}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
                    {host.bullets.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                  <a
                    href={`https://instagram.com/${host.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-ink hover:text-sage-dark"
                  >
                    <Icon name="instagram" className="h-5 w-5" />
                    {host.instagram}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
