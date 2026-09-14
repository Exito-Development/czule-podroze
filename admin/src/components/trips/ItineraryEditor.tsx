"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { ApiError } from "@/lib/api/client";
import { replaceItinerary } from "@/lib/api/endpoints";
import type { TripDayDto } from "@/lib/api/types";
import { clsx } from "@/lib/clsx";

const KNOWN_TAGS = [
  "warsztat",
  "fitness",
  "relaks",
  "wycieczka",
  "kultura",
  "integracja",
];

interface DayDraft {
  day: number;
  title: string;
  description: string;
  tags: string[];
}

/**
 * Plan dzień po dniu — to on rysuje pionową oś czasu na stronie wyjazdu.
 *
 * Numery dni nadajemy sami z kolejności, żeby nie dało się zapisać planu
 * z powtórzonym albo brakującym dniem.
 */
export default function ItineraryEditor({
  slug,
  itinerary,
  onSaved,
}: {
  slug: string;
  itinerary: TripDayDto[];
  onSaved: () => void;
}) {
  const [days, setDays] = useState<DayDraft[]>(() =>
    itinerary.map((day) => ({
      day: day.day,
      title: day.title,
      description: day.description,
      tags: day.tags ?? [],
    }))
  );
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = (index: number, patch: Partial<DayDraft>) => {
    setDays((current) =>
      current.map((day, position) => (position === index ? { ...day, ...patch } : day))
    );
    setSaved(false);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= days.length) return;
    const next = [...days];
    [next[index], next[target]] = [next[target], next[index]];
    setDays(next);
    setSaved(false);
  };

  const save = async () => {
    setProblem(null);
    setSaved(false);

    const incomplete = days.some(
      (day) => day.title.trim() === "" || day.description.trim() === ""
    );
    if (incomplete) {
      setProblem("Każdy dzień musi mieć tytuł i opis.");
      return;
    }
    if (days.length === 0) {
      setProblem("Plan musi mieć co najmniej jeden dzień.");
      return;
    }

    setBusy(true);
    try {
      // Numery nadajemy z kolejności — przeciąganie dni nie wymaga ich poprawiania.
      await replaceItinerary(
        slug,
        days.map((day, index) => ({
          day: index + 1,
          title: day.title.trim(),
          description: day.description.trim(),
          tags: day.tags,
        }))
      );
      setSaved(true);
      onSaved();
    } catch (exception) {
      setProblem(
        exception instanceof ApiError
          ? exception.message
          : "Nie udało się zapisać planu."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {problem && <Alert>{problem}</Alert>}
      {saved && <Alert tone="success">Plan zapisany.</Alert>}

      <Card
        title="Plan dzień po dniu"
        description={`${days.length} dni — w tej kolejności pojawią się na osi czasu.`}
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setDays((current) => [
                  ...current,
                  { day: current.length + 1, title: "", description: "", tags: [] },
                ])
              }
            >
              Dodaj dzień
            </Button>
            <Button size="sm" loading={busy} onClick={() => void save()}>
              Zapisz plan
            </Button>
          </div>
        }
        padded={false}
      >
        {days.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-soft">
            Plan jest pusty. Dodaj pierwszy dzień.
          </p>
        ) : (
          <ol className="divide-y divide-ink/6">
            {days.map((day, index) => (
              <li key={index} className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage text-xs text-white">
                    {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="W górę"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="W dół"
                      disabled={index === days.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDays((current) =>
                          current.filter((_, position) => position !== index)
                        )
                      }
                    >
                      Usuń
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  <TextField
                    label="Tytuł dnia"
                    value={day.title}
                    onChange={(value) => update(index, { title: value })}
                    placeholder="np. Warsztat otwarcia"
                  />
                  <TextAreaField
                    label="Opis"
                    value={day.description}
                    onChange={(value) => update(index, { description: value })}
                    rows={2}
                  />
                  <div>
                    <span className="field-label">Tagi</span>
                    <div className="flex flex-wrap gap-2">
                      {KNOWN_TAGS.map((tag) => {
                        const active = day.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              update(index, {
                                tags: active
                                  ? day.tags.filter((value) => value !== tag)
                                  : [...day.tags, tag],
                              })
                            }
                            className={clsx(
                              "rounded-full px-3 py-1 text-xs transition-colors",
                              active
                                ? "bg-sage text-white"
                                : "bg-cream text-ink-soft hover:bg-sand"
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
