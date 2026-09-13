import type { Metadata } from "next";
import { site } from "@/lib/data/site";
import FooterReveal from "@/components/layout/FooterReveal";

export const metadata: Metadata = {
  title: "Regulamin sklepu",
  description: "Regulamin sprzedaży wyjazdów Czułej Podróży.",
  alternates: { canonical: "/regulamin" },
  openGraph: { url: "/regulamin" },
};

/**
 * Szkielet regulaminu — treść do uzupełnienia przez klientki / prawnika.
 * Sekcje odpowiadają typowemu regulaminowi sklepu z usługami.
 */
const sections = [
  {
    title: "§1. Postanowienia ogólne",
    body: "Treść do uzupełnienia — dane sprzedawcy, definicje, zakres usług.",
  },
  {
    title: "§2. Rezerwacja i zawarcie umowy",
    body: "Treść do uzupełnienia — sposób składania rezerwacji, moment zawarcia umowy.",
  },
  {
    title: "§3. Płatności (zadatek i pełna kwota)",
    body: "Treść do uzupełnienia — wysokość zadatku, terminy dopłat, operator płatności.",
  },
  {
    title: "§4. Odstąpienie i rezygnacja",
    body: "Treść do uzupełnienia — warunki rezygnacji, zwroty, lista rezerwowa.",
  },
  {
    title: "§5. Reklamacje",
    body: "Treść do uzupełnienia — tryb składania i rozpatrywania reklamacji.",
  },
  {
    title: "§6. Dane osobowe i pliki cookie",
    body: "Treść do uzupełnienia — administrator danych, cele przetwarzania, cookies.",
  },
];

export default function RegulaminPage() {
  return (
    <main>
      <section className="section-pad relative z-10 bg-ivory pb-16 pt-36">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-5xl">Regulamin sklepu</h1>
          <p className="mt-4 text-sm text-ink-soft">
            Kontakt w sprawie regulaminu:{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
          </p>

          <div className="mt-12 space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-serif text-2xl">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FooterReveal />
    </main>
  );
}
