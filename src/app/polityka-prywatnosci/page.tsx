import type { Metadata } from "next";
import { site } from "@/lib/data/site";
import FooterReveal from "@/components/layout/FooterReveal";
import UstawieniaCookies from "@/components/layout/UstawieniaCookies";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Jak przetwarzamy dane osobowe uczestniczek wyjazdów Czułej Podróży i jakich plików cookie używamy.",
  alternates: { canonical: "/polityka-prywatnosci" },
  openGraph: { url: "/polityka-prywatnosci" },
};

export default function PolitykaPrywatnosciPage() {
  return (
    <main>
      <section className="section-pad relative z-10 bg-ivory pb-16 pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">Dokumenty</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Polityka prywatności</h1>

          <div className="mt-10 space-y-8 text-ink-soft">
            <section>
              <h2 className="font-serif text-2xl text-ink">Kto odpowiada za Twoje dane</h2>
              <p className="mt-3">
                Administratorem danych jest organizator wyjazdów Czuła Podróż. W sprawach
                dotyczących danych osobowych napisz na{" "}
                <a className="underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-ink">Jakie dane zbieramy i po co</h2>
              <dl className="mt-3 space-y-4">
                <div>
                  <dt className="font-medium text-ink">Rezerwacja wyjazdu</dt>
                  <dd>
                    Imię, nazwisko, e-mail i telefon — bez nich nie zawrzemy umowy ani nie
                    wyślemy Ci potwierdzenia. Dane trzymamy przez czas potrzebny do
                    rozliczenia wyjazdu i przez okres wymagany przepisami podatkowymi.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">Formularz kontaktowy</dt>
                  <dd>
                    Imię, e-mail i treść wiadomości — po to, żeby Ci odpowiedzieć.
                    Wiadomości usuwamy, gdy sprawa jest zamknięta.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">Lista rezerwowa</dt>
                  <dd>
                    Imię, e-mail i telefon — żeby dać znać, gdy zwolni się miejsce.
                    Możesz w każdej chwili poprosić o usunięcie z listy.
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-ink">Pliki cookie</h2>
              <p className="mt-3">
                <strong className="text-ink">Niezbędne</strong> — pozwalają działać
                koszykowi, blokadzie miejsca i zapamiętują Twój wybór dotyczący cookies.
                Bez nich strona nie zadziała, więc nie pytamy o zgodę na nie.
              </p>
              <p className="mt-3">
                <strong className="text-ink">Analityczne</strong> — anonimowe statystyki
                odwiedzin. Uruchamiamy je wyłącznie po Twojej zgodzie i możesz ją cofnąć
                w dowolnym momencie.
              </p>
              <div className="mt-5">
                <UstawieniaCookies className="rounded-full border border-ink/20 px-5 py-2 text-sm text-ink hover:bg-ink/5" />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-ink">Twoje prawa</h2>
              <p className="mt-3">
                Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia,
                ograniczenia przetwarzania, przenoszenia oraz sprzeciwu. Możesz też cofnąć
                zgodę — nie wpływa to na to, co zrobiliśmy przed cofnięciem. Jeśli uznasz,
                że przetwarzamy dane niewłaściwie, możesz złożyć skargę do Prezesa Urzędu
                Ochrony Danych Osobowych.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-ink">Komu przekazujemy dane</h2>
              <p className="mt-3">
                Wyłącznie podmiotom, bez których wyjazd nie mógłby się odbyć: operatorowi
                płatności, dostawcy poczty elektronicznej i dostawcy hostingu. Nie
                sprzedajemy danych i nie przekazujemy ich do celów marketingowych osobom
                trzecim.
              </p>
            </section>

            <p className="rounded-2xl bg-cream/70 p-5 text-sm">
              <strong className="text-ink">Do uzupełnienia przed publikacją:</strong> pełna
              nazwa podmiotu, adres siedziby i NIP administratora danych, a także lista
              konkretnych dostawców (operator płatności, poczta, hosting). Tych danych nie
              wpisujemy „na oko" — dokument powinien też przejrzeć prawnik.
            </p>
          </div>
        </div>
      </section>
      <FooterReveal />
    </main>
  );
}
