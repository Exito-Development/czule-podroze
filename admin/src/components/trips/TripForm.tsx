"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  CheckboxField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { ApiError } from "@/lib/api/client";
import type { TripDto, TripUpsertPayload } from "@/lib/api/types";
import { toDateInput } from "@/lib/format";

const CONTINENTS = ["Azja", "Afryka", "Europa"];

interface FormState {
  slug: string;
  title: string;
  tagline: string;
  continent: string;
  country: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  price: number;
  deposit: number;
  capacity: number;
  coverImage: string;
  published: boolean;
  included: string[];
  destinations: { name: string; dayRange: string; description: string; image: string }[];
}

function initialState(trip?: TripDto): FormState {
  return {
    slug: trip?.slug ?? "",
    title: trip?.title ?? "",
    tagline: trip?.tagline ?? "",
    continent: trip?.continent ?? CONTINENTS[0],
    country: trip?.country ?? "",
    durationDays: trip?.durationDays ?? 7,
    startDate: toDateInput(trip?.startDate),
    endDate: toDateInput(trip?.endDate),
    price: trip?.price ?? 0,
    deposit: trip?.deposit ?? 0,
    capacity: trip?.capacity ?? 10,
    coverImage: trip?.coverImage ?? "",
    // `status === "upcoming"` oznacza wyjazd nieopublikowany.
    published: trip ? trip.status !== "upcoming" : false,
    included: trip?.included ?? [],
    destinations: trip?.destinations ?? [],
  };
}

/** Etykiety pól — te same, które widać w formularzu. */
const ETYKIETY: Record<string, string> = {
  slug: "Adres w URL",
  title: "Nazwa wyjazdu",
  tagline: "Hasło (podtytuł)",
  continent: "Kontynent",
  country: "Kraj",
  durationDays: "Liczba dni",
  startDate: "Początek",
  endDate: "Koniec",
  price: "Cena za osobę",
  deposit: "Zadatek",
  capacity: "Liczba miejsc",
  coverImage: "Zdjęcie główne",
  name: "Nazwa",
  dayRange: "Zakres dni",
  description: "Opis",
  image: "Zdjęcie",
};

type Bledy = Record<string, string>;

/**
 * Sprawdza formularz przed wysłaniem.
 *
 * Dotąd walidację robiło wyłącznie API, a panel pokazywał z niej samo
 * "Formularz zawiera błędy" — bez wskazania pola. Sprawdzenie tutaj daje
 * odpowiedź od razu i w miejscu, w którym trzeba poprawić.
 */
function sprawdz(form: FormState): Bledy {
  const bledy: Bledy = {};
  const pusty = (wartosc: string) => wartosc.trim() === "";

  if (pusty(form.title)) bledy.title = "Podaj nazwę wyjazdu.";
  if (pusty(form.tagline)) bledy.tagline = "Dodaj krótkie hasło — pokazuje się pod nazwą.";
  if (pusty(form.country)) bledy.country = "Podaj kraj lub kraje wyjazdu.";
  if (form.durationDays < 1) bledy.durationDays = "Wyjazd musi trwać co najmniej dzień.";
  if (pusty(form.startDate)) bledy.startDate = "Wybierz datę rozpoczęcia.";
  if (pusty(form.endDate)) bledy.endDate = "Wybierz datę zakończenia.";
  if (!pusty(form.startDate) && !pusty(form.endDate) && form.endDate < form.startDate) {
    bledy.endDate = "Koniec nie może wypadać przed początkiem.";
  }
  if (form.price <= 0) bledy.price = "Podaj cenę większą od zera.";
  if (form.deposit < 0) bledy.deposit = "Zadatek nie może być ujemny.";
  if (form.deposit > form.price) bledy.deposit = "Zadatek nie może przewyższać ceny.";
  if (form.capacity < 1) bledy.capacity = "Musi być przynajmniej jedno miejsce.";

  // Destynacja liczy się dopiero, gdy cokolwiek w niej wpisano — pusty wiersz
  // dodany przez przypadek nie ma blokować zapisu, bo i tak go odsiewamy.
  form.destinations.forEach((destynacja, index) => {
    const cokolwiek =
      !pusty(destynacja.name) ||
      !pusty(destynacja.dayRange) ||
      !pusty(destynacja.description) ||
      !pusty(destynacja.image);
    if (!cokolwiek) return;
    if (pusty(destynacja.name)) bledy[`destinations.${index}.name`] = "Podaj nazwę miejsca.";
    if (pusty(destynacja.dayRange))
      bledy[`destinations.${index}.dayRange`] = "Podaj zakres dni, na przykład: Dni 1-5.";
    if (pusty(destynacja.description))
      bledy[`destinations.${index}.description`] = "Dodaj krótki opis miejsca.";
  });

  return bledy;
}

/**
 * Zamienia ścieżkę pola z API na klucz używany w formularzu.
 *
 * API zgłasza `destinations[0].image`, formularz trzyma `destinations.0.image`.
 */
function kluczZApi(sciezka: string): string {
  return sciezka.replace(/\[(\d+)\]/g, ".$1");
}

/** Czytelny opis błędu z API — na wypadek reguły, której nie sprawdzamy u siebie. */
function opisBledu(sciezka: string, komunikat: string): string {
  const czesci = kluczZApi(sciezka).split(".");
  const ostatnia = czesci[czesci.length - 1];
  const etykieta = ETYKIETY[ostatnia] ?? ostatnia;
  const indeks = czesci.find((czesc) => /^\d+$/.test(czesc));
  const gdzie = indeks !== undefined ? ` (destynacja ${Number(indeks) + 1})` : "";
  return `${etykieta}${gdzie}: ${komunikat}`;
}


/** Adres w URL-u budujemy z tytułu — organizatorka nie musi znać pojęcia „slug". */
function slugify(value: string): string {
  const map: Record<string, string> = {
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  };
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (letter) => map[letter] ?? letter)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Formularz danych wyjazdu.
 *
 * Plan dzień po dniu ma własny edytor (osobna zakładka), więc ten formularz
 * go nie wysyła — API zostawia wtedy plan nietknięty.
 */
export default function TripForm({
  trip,
  onSubmit,
  submitLabel,
}: {
  trip?: TripDto;
  onSubmit: (payload: TripUpsertPayload) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormState>(() => initialState(trip));
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [bledy, setBledy] = useState<Bledy>({});

  const isEdit = trip !== undefined;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProblem(null);
    setSaved(false);

    const znalezione = sprawdz(form);
    setBledy(znalezione);
    if (Object.keys(znalezione).length > 0) {
      setProblem("Uzupełnij pola oznaczone na czerwono.");
      return;
    }

    setBusy(true);
    try {
      await onSubmit({
        slug: form.slug || slugify(form.title),
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        continent: form.continent,
        country: form.country.trim(),
        durationDays: form.durationDays,
        startDate: form.startDate,
        endDate: form.endDate,
        price: form.price,
        deposit: form.deposit,
        capacity: form.capacity,
        coverImage: form.coverImage.trim(),
        published: form.published,
        included: form.included.filter((item) => item.trim() !== ""),
        destinations: form.destinations
          .filter((destination) => destination.name.trim() !== "")
          .map((destination, index) => ({ ...destination, position: index })),
        // Plan dzień po dniu edytujemy osobno — pominięcie zostawia go bez zmian.
      });
      setSaved(true);
    } catch (exception) {
      if (exception instanceof ApiError && exception.fieldErrors.length > 0) {
        // Reguła, której nie sprawdzamy u siebie — pokazujemy ją przy polu
        // i wypisujemy w nagłówku, żeby nie trzeba było jej szukać.
        setBledy(
          Object.fromEntries(
            exception.fieldErrors.map((blad) => [kluczZApi(blad.field), blad.message])
          )
        );
        setProblem(
          exception.fieldErrors
            .map((blad) => opisBledu(blad.field, blad.message))
            .join(" · ")
        );
      } else {
        setProblem(
          exception instanceof ApiError
            ? exception.message
            : "Nie udało się zapisać. Spróbuj ponownie."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    /*
      `noValidate` wyłącza walidację przeglądarki. Jej komunikaty są po
      angielsku, pokazują się pojedynczo i nie obejmują reguł łączących pola
      (zadatek kontra cena, koniec kontra początek). Sprawdzamy więc sami —
      po polsku, wszystko naraz i przy właściwych polach.
    */
    <form onSubmit={submit} noValidate className="space-y-6">
      {problem && <Alert>{problem}</Alert>}
      {saved && <Alert tone="success">Zapisano zmiany.</Alert>}

      <Card title="Podstawowe dane">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Nazwa wyjazdu"
            error={bledy.title}
            value={form.title}
            onChange={(value) => {
              set("title", value);
              if (!isEdit) set("slug", slugify(value));
            }}
            required
          />
          <TextField
            label="Adres w URL"
            value={form.slug}
            onChange={(value) => set("slug", slugify(value))}
            disabled={isEdit}
            required
            hint={
              isEdit
                ? "Adresu nie zmieniamy — linki do wyjazdu są już w obiegu."
                : "Tworzy się sam z nazwy; możesz poprawić."
            }
          />
          <TextField
            label="Hasło (podtytuł)"
            error={bledy.tagline}
            value={form.tagline}
            onChange={(value) => set("tagline", value)}
            required
            className="md:col-span-2"
          />
          <SelectField
            label="Kontynent"
            value={form.continent}
            onChange={(value) => set("continent", value)}
            options={CONTINENTS.map((value) => ({ value, label: value }))}
          />
          <TextField
            label="Kraj"
            error={bledy.country}
            value={form.country}
            onChange={(value) => set("country", value)}
            required
          />
          <TextField
            label="Zdjęcie główne (URL)"
            hint="Nieobowiązkowe — bez niego pokażemy grafikę zastępczą."
            error={bledy.coverImage}
            value={form.coverImage}
            onChange={(value) => set("coverImage", value)}
            className="md:col-span-2"
          />
        </div>
      </Card>

      <Card title="Termin, cena i miejsca">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="Początek"
            error={bledy.startDate}
            type="date"
            value={form.startDate}
            onChange={(value) => set("startDate", value)}
            required
          />
          <TextField
            label="Koniec"
            error={bledy.endDate}
            type="date"
            value={form.endDate}
            onChange={(value) => set("endDate", value)}
            required
          />
          <NumberField
            label="Liczba dni"
            error={bledy.durationDays}
            value={form.durationDays}
            onChange={(value) => set("durationDays", value)}
            min={1}
            required
          />
          <NumberField
            label="Cena za osobę (zł)"
            error={bledy.price}
            value={form.price}
            onChange={(value) => set("price", value)}
            min={0}
            step={100}
            required
          />
          <NumberField
            label="Zadatek (zł)"
            error={bledy.deposit}
            value={form.deposit}
            onChange={(value) => set("deposit", value)}
            min={0}
            step={100}
            required
            hint="Kwota, którą klientka płaci przy rezerwacji."
          />
          <NumberField
            label="Liczba miejsc"
            error={bledy.capacity}
            value={form.capacity}
            onChange={(value) => set("capacity", value)}
            min={1}
            required
            hint={
              isEdit
                ? "Nie może być mniejsza niż liczba sprzedanych miejsc."
                : undefined
            }
          />
        </div>

        <div className="mt-5 border-t border-ink/8 pt-5">
          <CheckboxField
            label="Opublikowany — widoczny na stronie i możliwy do kupienia"
            hint="Nieopublikowany wyjazd pokazuje się na stronie jako „wkrótce”."
            checked={form.published}
            onChange={(value) => set("published", value)}
          />
        </div>
      </Card>

      <Card
        title="W cenie"
        description="Lista, którą klientka widzi na stronie wyjazdu."
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => set("included", [...form.included, ""])}
          >
            Dodaj pozycję
          </Button>
        }
      >
        {form.included.length === 0 ? (
          <p className="text-sm text-ink-soft">Jeszcze nic nie dodano.</p>
        ) : (
          <ul className="space-y-2">
            {form.included.map((item, index) => (
              <li key={index} className="flex gap-2">
                <input
                  value={item}
                  onChange={(event) => {
                    const next = [...form.included];
                    next[index] = event.target.value;
                    set("included", next);
                  }}
                  className="field-input"
                  placeholder="np. Warsztaty psychologiczne"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Usuń pozycję"
                  onClick={() =>
                    set(
                      "included",
                      form.included.filter((_, position) => position !== index)
                    )
                  }
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Destynacje"
        description="Kolejne miejsca w ramach jednego wyjazdu."
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              set("destinations", [
                ...form.destinations,
                { name: "", dayRange: "", description: "", image: "" },
              ])
            }
          >
            Dodaj destynację
          </Button>
        }
      >
        {form.destinations.length === 0 ? (
          <p className="text-sm text-ink-soft">Jeszcze nic nie dodano.</p>
        ) : (
          <ul className="space-y-4">
            {form.destinations.map((destination, index) => (
              <li key={index} className="rounded-xl bg-cream/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                    Destynacja {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      set(
                        "destinations",
                        form.destinations.filter((_, position) => position !== index)
                      )
                    }
                  >
                    Usuń
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField
                    label="Nazwa"
                    required
                    error={bledy[`destinations.${index}.name`]}
                    value={destination.name}
                    onChange={(value) => {
                      const next = [...form.destinations];
                      next[index] = { ...destination, name: value };
                      set("destinations", next);
                    }}
                  />
                  <TextField
                    label="Zakres dni"
                    required
                    error={bledy[`destinations.${index}.dayRange`]}
                    value={destination.dayRange}
                    onChange={(value) => {
                      const next = [...form.destinations];
                      next[index] = { ...destination, dayRange: value };
                      set("destinations", next);
                    }}
                    hint="np. Dni 1–5"
                  />
                  <TextField
                    label="Zdjęcie (URL)"
                    hint="Nieobowiązkowe — bez niego pokażemy grafikę zastępczą."
                    error={bledy[`destinations.${index}.image`]}
                    value={destination.image}
                    onChange={(value) => {
                      const next = [...form.destinations];
                      next[index] = { ...destination, image: value };
                      set("destinations", next);
                    }}
                    className="md:col-span-2"
                  />
                  <TextAreaField
                    label="Opis"
                    required
                    error={bledy[`destinations.${index}.description`]}
                    value={destination.description}
                    onChange={(value) => {
                      const next = [...form.destinations];
                      next[index] = { ...destination, description: value };
                      set("destinations", next);
                    }}
                    rows={2}
                    className="md:col-span-2"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
