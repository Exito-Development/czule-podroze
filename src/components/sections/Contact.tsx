"use client";

import { useState } from "react";
import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/anim/Reveal";
import { ApiError } from "@/lib/api/client";
import { sendContactMessage } from "@/lib/api/contact";

const TEMATY = [
  "Pytanie o konkretny wyjazd",
  "Nie wiem, który wyjazd wybrać",
  "Jadę sama — jak to wygląda?",
  "Płatności i raty",
  "Coś innego",
];

type Stan = "formularz" | "wysylam" | "wyslane";

/**
 * Sekcja kontaktowa z formularzem.
 *
 * Dotąd pozycja „Kontakt" w menu prowadziła do stopki, czyli na sam koniec
 * strony — do adresu e-mail i niczego więcej. Formularz jest tu po to, żeby
 * pytanie dało się zadać od razu, bez przełączania się do poczty.
 */
export default function Contact() {
  const [stan, setStan] = useState<Stan>("formularz");
  const [bledy, setBledy] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: TEMATY[0],
    message: "",
    botField: "",
  });

  const ustaw = (pole: keyof typeof form, wartosc: string) => {
    setForm((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
    setBledy(({ [pole]: _pominiete, ...reszta }) => reszta);
  };

  const wyslij = async (event: React.FormEvent) => {
    event.preventDefault();
    setProblem(null);

    const znalezione: Record<string, string> = {};
    if (form.name.trim() === "") znalezione.name = "Podaj imię — będzie nam milej.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      znalezione.email = "Podaj adres e-mail, na który mamy odpisać.";
    }
    if (form.message.trim().length < 10) {
      znalezione.message = "Napisz choć dwa zdania — łatwiej nam będzie pomóc.";
    }
    setBledy(znalezione);
    if (Object.keys(znalezione).length > 0) return;

    setStan("wysylam");
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        topic: form.topic,
        message: form.message.trim(),
        botField: form.botField,
      });
      setStan("wyslane");
    } catch (wyjatek) {
      setStan("formularz");
      if (wyjatek instanceof ApiError && wyjatek.fieldErrors.length > 0) {
        setBledy(
          Object.fromEntries(wyjatek.fieldErrors.map((b) => [b.field, b.message]))
        );
        return;
      }
      // Bez połączenia z API zostaje droga zapasowa: zwykły e-mail. Lepsze to
      // niż komunikat o błędzie, po którym klientka nie wie, co dalej.
      setProblem(
        `Nie udało się wysłać wiadomości. Napisz do nas na ${site.email} — odpiszemy tak samo.`
      );
    }
  };

  if (stan === "wyslane") {
    return (
      <section id="kontakt" className="section-pad section-y bg-blush-pale">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage/25">
            <Icon name="heart" className="h-7 w-7 text-sage-dark" />
          </span>
          <h2 className="mt-5 font-serif text-3xl md:text-4xl">Mamy Twoją wiadomość</h2>
          <p className="mt-3 text-ink-soft">
            Odpisujemy zwykle w ciągu jednego dnia roboczego. Jeśli sprawa jest pilna,
            zadzwoń albo napisz wprost na{" "}
            <a className="underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="section-pad section-y bg-blush-pale">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.3em] text-sage-dark">Kontakt</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Napisz do nas</h2>
          <p className="mt-4 text-ink-soft">
            Zastanawiasz się, czy ten wyjazd jest dla Ciebie? Chcesz zapytać o termin,
            pokój albo o to, jak wygląda dzień na miejscu? Napisz — odpowiadamy my, nie
            automat.
          </p>
          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Icon name="heart" className="h-4 w-4 text-sage-dark" />
              <dd>
                <a className="underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="users" className="h-4 w-4 text-sage-dark" />
              <dd>Odpisujemy w ciągu jednego dnia roboczego</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={wyslij}
            noValidate
            className="rounded-3xl bg-ivory/80 p-6 shadow-sm backdrop-blur md:p-8"
          >
            {problem && (
              <p className="mb-4 rounded-2xl bg-blush-soft px-4 py-3 text-sm">{problem}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Pole
                label="Imię"
                wartosc={form.name}
                onChange={(v) => ustaw("name", v)}
                blad={bledy.name}
                autoComplete="given-name"
              />
              <Pole
                label="E-mail"
                type="email"
                wartosc={form.email}
                onChange={(v) => ustaw("email", v)}
                blad={bledy.email}
                autoComplete="email"
              />
              <Pole
                label="Telefon (opcjonalnie)"
                type="tel"
                wartosc={form.phone}
                onChange={(v) => ustaw("phone", v)}
                blad={bledy.phone}
                autoComplete="tel"
              />
              <label className="block">
                <span className="mb-1 block text-sm text-ink-soft">W jakiej sprawie?</span>
                <select
                  value={form.topic}
                  onChange={(event) => ustaw("topic", event.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-sm"
                >
                  {TEMATY.map((temat) => (
                    <option key={temat}>{temat}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm text-ink-soft">Wiadomość</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(event) => ustaw("message", event.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-sm"
              />
              {bledy.message && (
                <span className="mt-1 block text-xs font-medium text-red-700">
                  {bledy.message}
                </span>
              )}
            </label>

            {/*
              Pułapka na roboty. Ukryta przed człowiekiem i przed czytnikiem
              ekranu (`aria-hidden` + `tabIndex`), więc wypełnić ją może tylko
              automat uzupełniający wszystkie pola formularza.
            */}
            <div className="absolute left-[-9999px]" aria-hidden>
              <label>
                Nie wypełniaj tego pola
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.botField}
                  onChange={(event) => ustaw("botField", event.target.value)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={stan === "wysylam"}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage px-7 py-3.5 text-sm font-medium text-ivory transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {stan === "wysylam" ? "Wysyłam…" : "Wyślij wiadomość"}
              <Icon name="palm" className="h-4 w-4" />
            </button>
            <p className="mt-3 text-xs text-ink-faint">
              Adres wykorzystamy wyłącznie po to, żeby Ci odpisać.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Pole({
  label,
  wartosc,
  onChange,
  blad,
  type = "text",
  autoComplete,
}: {
  label: string;
  wartosc: string;
  onChange: (wartosc: string) => void;
  blad?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink-soft">{label}</span>
      <input
        type={type}
        value={wartosc}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-sm"
      />
      {blad && <span className="mt-1 block text-xs font-medium text-red-700">{blad}</span>}
    </label>
  );
}
