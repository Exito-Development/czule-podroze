import Link from "next/link";
import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer
      id="kontakt"
      className="bg-ecru/60 text-ink"
    >
      <div className="section-pad grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex flex-col leading-none">
            <span className="font-serif text-2xl uppercase tracking-[0.2em]">
              Czuła
            </span>
            <span className="font-script text-3xl text-blush">podróż</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-ink-soft">
            {site.tagline}. Kameralne wyjazdy z warsztatami, ruchem i czasem dla
            siebie — w najpiękniejszych miejscach świata.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg">Nawigacja</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/#destynacje" className="hover:text-ink">
                Nasze wyjazdy
              </Link>
            </li>
            <li>
              <Link href="/#o-nas" className="hover:text-ink">
                O nas
              </Link>
            </li>
            <li>
              <Link href="/rezerwacja" className="hover:text-ink">
                Moja rezerwacja
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-ink">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/regulamin" className="hover:text-ink">
                Regulamin sklepu
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg">Kontakt</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-ink">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-ink"
              >
                <Icon name="instagram" className="h-5 w-5" />
                @czulapodroz
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="section-pad flex flex-col items-center justify-between gap-2 border-t border-ink/10 py-6 text-xs text-ink-soft md:flex-row">
        <span>
          © {new Date().getFullYear()} {site.name}. Wszelkie prawa zastrzeżone.
        </span>
        <span>Zaprojektowane z czułością ♡</span>
        <a
          href="https://exito-development.pl"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-ink"
        >
          Realizacja: exito-development.pl
        </a>
      </div>
    </footer>
  );
}
