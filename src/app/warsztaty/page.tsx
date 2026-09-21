import type { Metadata } from "next";
import Link from "next/link";
import { workshops } from "@/lib/data/site";
import { fetchTrips } from "@/lib/api/trips";
import FooterReveal from "@/components/layout/FooterReveal";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Warsztaty dla kobiet — psychologiczne, seksuologiczne i mindfulness",
  description:
    "Warsztaty dla kobiet prowadzone przez psycholożki i seksuolożkę: granice i bliskość, wysoka wrażliwość, wypalenie, mindfulness i praca z ciałem. W kameralnych grupach, podczas wyjazdów do Portugalii, na Zanzibar i do Azji.",
  alternates: { canonical: "/warsztaty" },
  openGraph: {
    title: "Warsztaty dla kobiet — psychologiczne, seksuologiczne i mindfulness",
    description:
      "Autorskie warsztaty prowadzone przez psycholożki i seksuolożkę, w grupach do 10 osób, podczas wyjazdów za granicę.",
    url: "/warsztaty",
    type: "article",
    locale: "pl_PL",
  },
};

/**
 * Strona warsztatów.
 *
 * Powstała z powodu SEO, ale nie jest „stroną pod SEO": frazy w rodzaju
 * „warsztaty dla kobiet" czy „warsztaty seksuologiczne" nie miały dotąd na
 * czym rankować, bo strona główna opisuje wyjazdy, a nie to, co się na nich
 * dzieje. Tekst ma odpowiadać na pytania, z którymi ludzie faktycznie
 * przychodzą — upychanie fraz działa dziś przeciw stronie, nie dla niej.
 */
export default async function WarsztatyPage() {
  const trips = await fetchTrips();

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Strona główna", path: "/" },
          { name: "Warsztaty", path: "/warsztaty" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Warsztaty dla kobiet",
          itemListElement: workshops.map((warsztat, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: warsztat.title,
            description: warsztat.description,
            url: absoluteUrl(`/warsztaty#${warsztat.id}`),
          })),
        }}
      />

      <section className="section-pad relative z-10 bg-ivory pb-16 pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">Warsztaty</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            Warsztaty dla kobiet, które zostają z Tobą na dłużej
          </h1>
          <p className="mt-6 text-lg text-ink-soft">
            Prowadzimy warsztaty psychologiczne i seksuologiczne dla kobiet — nie w sali
            konferencyjnej, tylko podczas wyjazdów do miejsc, w których łatwiej się
            zatrzymać. Grupa liczy maksymalnie dziesięć osób, więc każda ma czas i
            przestrzeń, żeby powiedzieć to, z czym przyjechała.
          </p>
          <p className="mt-4 text-ink-soft">
            Warsztaty prowadzą Wiktoria i Natalia — psycholożka oraz psycholożka i
            seksuolożka. To nie są wykłady: pracujemy w kręgu, ćwiczeniami, rozmową i
            pracą z ciałem. Nikt nie musi mówić więcej, niż chce.
          </p>
        </div>
      </section>

      <section className="section-pad section-y bg-cream">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl">Tematy, wokół których pracujemy</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Każdy wyjazd ma własną agendę — poniżej tematy, które wracają najczęściej.
          </p>
          <div className="mt-10 space-y-8">
            {workshops.map((warsztat) => (
              <article key={warsztat.id} id={warsztat.id} className="scroll-mt-28">
                <h3 className="font-serif text-2xl">{warsztat.title}</h3>
                <p className="mt-1 text-sm uppercase tracking-[0.2em] text-sage-dark">
                  {warsztat.tagline}
                </p>
                <p className="mt-3 max-w-2xl text-ink-soft">{warsztat.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-y bg-ivory">
        <div className="mx-auto max-w-3xl space-y-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">
              Dla kogo są te wyjazdy z warsztatami
            </h2>
            <p className="mt-4 text-ink-soft">
              Dla kobiet w każdym wieku. Przyjeżdżają do nas osoby po rozstaniu, po
              wypaleniu w pracy, po latach opieki nad innymi, a także takie, u których nic
              złego się nie dzieje — po prostu chcą tygodnia dla siebie. Blisko połowa
              uczestniczek przyjeżdża sama i nikt nie zostaje sam.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl md:text-4xl">
              Mindfulness, ruch i odpoczynek
            </h2>
            <p className="mt-4 text-ink-soft">
              Poranki zaczynamy od jogi albo krótkiej praktyki uważności — bez przymusu,
              kto woli pospać, śpi. Mindfulness traktujemy praktycznie: jako sposób na
              wyhamowanie głowy, nie jako filozofię. Po południu jest czas wolny, bo
              odpoczynek jest częścią programu, a nie przerwą w nim.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl md:text-4xl">
              Czym to się różni od zwykłego wyjazdu
            </h2>
            <p className="mt-4 text-ink-soft">
              Babskie wyjazdy kojarzą się zwykle z wieczorem przy winie — i to też u nas
              bywa. Różnica polega na tym, że obok tego jest praca, którą prowadzą osoby
              z wykształceniem psychologicznym, oraz grupa na tyle mała, żeby dało się
              w niej być sobą. Wracasz z czymś więcej niż zdjęciami.
            </p>
          </div>
        </div>
      </section>

      {trips.length > 0 && (
        <section className="section-pad section-y bg-sage-pale">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl md:text-4xl">
              Najbliższe wyjazdy z warsztatami
            </h2>
            <ul className="mt-8 space-y-4">
              {trips.map((trip) => (
                <li key={trip.slug}>
                  <Link
                    href={`/wyjazdy/${trip.slug}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-ivory/70 px-6 py-5 transition-colors hover:bg-ivory"
                  >
                    <span className="font-serif text-xl">{trip.title}</span>
                    <span className="text-sm text-ink-soft">
                      {trip.country} · {trip.durationDays} dni
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8">
              <Link href="/#destynacje" className="underline hover:text-ink">
                Zobacz wszystkie wyjazdy
              </Link>
            </p>
          </div>
        </section>
      )}

      <FooterReveal />
    </main>
  );
}
