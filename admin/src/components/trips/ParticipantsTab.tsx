"use client";

import { useState } from "react";
import Link from "next/link";
import Badge, { participantStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";
import Modal from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import {
  cancelParticipant,
  restoreParticipant,
  roster,
  rosterCsv,
  updateParticipant,
} from "@/lib/api/endpoints";
import type { ParticipantDto } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatPrice, seats } from "@/lib/format";

/**
 * Lista uczestniczek wyjazdu.
 *
 * Każdy wiersz to jedno kupione miejsce. Dane znamy tylko dla osoby
 * rezerwującej — pozostałe miejsca są oznaczone jako „do uzupełnienia”,
 * bo to je organizatorki muszą uzupełnić przed wyjazdem.
 */
export default function ParticipantsTab({ slug }: { slug: string }) {
  const { data, loading, error, reload } = useAsync(() => roster(slug), [slug]);
  const [editing, setEditing] = useState<ParticipantDto | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const download = async () => {
    try {
      const csv = await rosterCsv(slug);
      const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `uczestnicy-${slug}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setProblem("Nie udało się pobrać listy.");
    }
  };

  const toggleStatus = async (participant: ParticipantDto) => {
    setProblem(null);
    try {
      if (participant.status === "CONFIRMED") {
        await cancelParticipant(participant.id);
      } else {
        await restoreParticipant(participant.id);
      }
      reload();
    } catch (exception) {
      setProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się zapisać."
      );
    }
  };

  // Spinner tylko przy pierwszym wejściu; odświeżenie zostawia widoczne dane.
  if (loading && !data) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {problem && <Alert onDismiss={() => setProblem(null)}>{problem}</Alert>}

      <div className="grid gap-4 sm:grid-cols-4">
        <Summary label="Sprzedane" value={`${data.seatsSold} / ${data.capacity}`} />
        <Summary label="Wolne" value={String(data.seatsAvailable)} />
        <Summary
          label="Bez danych"
          value={String(data.incomplete)}
          warn={data.incomplete > 0}
        />
        <Summary label="Do dopłaty" value={formatPrice(data.balanceDue)} />
      </div>

      {data.seatsPending > 0 && (
        <Alert tone="info">
          Dodatkowo {seats(data.seatsPending)} czeka w zamówieniach nieopłaconych
          — pojawią się na liście po zaksięgowaniu wpłaty.
        </Alert>
      )}

      <Card
        title="Kto jedzie"
        description="Jeden wiersz to jedno kupione miejsce."
        padded={false}
        action={
          <Button variant="secondary" size="sm" onClick={() => void download()}>
            Pobierz CSV
          </Button>
        }
      >
        {data.participants.length === 0 ? (
          <EmptyState
            title="Nikt jeszcze nie kupił miejsca"
            description="Lista wypełni się sama, gdy pojawią się opłacone rezerwacje."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Osoba</th>
                  <th>Kontakt</th>
                  <th>Uwagi</th>
                  <th>Rezerwacja</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.participants.map((participant) => {
                  const status =
                    participantStatus[participant.status] ?? {
                      label: participant.status,
                      tone: "neutral" as const,
                    };
                  return (
                    <tr key={participant.id}>
                      <td>
                        <span
                          className={
                            participant.incomplete
                              ? "text-ink-faint italic"
                              : "font-medium"
                          }
                        >
                          {participant.displayName}
                        </span>
                        {participant.contactPerson && (
                          <Badge tone="info" className="ml-2">
                            rezerwująca
                          </Badge>
                        )}
                      </td>
                      <td className="text-ink-soft">
                        {participant.email ?? "—"}
                        {participant.phone && (
                          <span className="block text-xs">{participant.phone}</span>
                        )}
                      </td>
                      <td className="max-w-[16rem] text-ink-soft">
                        {participant.note ?? "—"}
                      </td>
                      <td>
                        <Link
                          href={`/zamowienia/${participant.orderNumber}`}
                          className="text-xs hover:underline"
                        >
                          {participant.orderNumber}
                        </Link>
                        {participant.balanceDue > 0 && (
                          <span className="block text-xs text-ink-faint">
                            dopłata {formatPrice(participant.balanceDue)}
                          </span>
                        )}
                      </td>
                      <td>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditing(participant)}
                          >
                            {participant.incomplete ? "Uzupełnij" : "Edytuj"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void toggleStatus(participant)}
                          >
                            {participant.status === "CONFIRMED"
                              ? "Rezygnacja"
                              : "Przywróć"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ParticipantModal
        participant={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
    </div>
  );
}

function Summary({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 ring-1 ring-ink/8">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className={`mt-1 font-serif text-xl ${warn ? "text-danger" : ""}`}>{value}</p>
    </div>
  );
}

function ParticipantModal({
  participant,
  onClose,
  onSaved,
}: {
  participant: ParticipantDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Wypełniamy formularz przy otwarciu dla nowej osoby.
  if (participant && loadedFor !== participant.id) {
    setLoadedFor(participant.id);
    setForm({
      firstName: participant.firstName ?? "",
      lastName: participant.lastName ?? "",
      email: participant.email ?? "",
      phone: participant.phone ?? "",
      note: participant.note ?? "",
    });
    setProblem(null);
  }

  const save = async () => {
    if (!participant) return;
    setBusy(true);
    setProblem(null);
    try {
      await updateParticipant(participant.id, {
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        note: form.note.trim() || undefined,
      });
      onSaved();
    } catch (exception) {
      setProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się zapisać."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={participant !== null}
      title={`Miejsce ${participant?.seatNumber ?? ""} — ${participant?.orderNumber ?? ""}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button loading={busy} onClick={() => void save()}>
            Zapisz
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {problem && <Alert>{problem}</Alert>}
        <p className="text-sm text-ink-soft">
          Rezerwację złożyła {participant?.bookedByName} ({participant?.bookedByEmail}).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Imię"
            value={form.firstName}
            onChange={(value) => setForm({ ...form, firstName: value })}
          />
          <TextField
            label="Nazwisko"
            value={form.lastName}
            onChange={(value) => setForm({ ...form, lastName: value })}
          />
          <TextField
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            hint="Bez adresu ta osoba nie dostanie wiadomości."
          />
          <TextField
            label="Telefon"
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
          />
        </div>
        <TextAreaField
          label="Uwagi"
          value={form.note}
          onChange={(value) => setForm({ ...form, note: value })}
          rows={3}
          hint="Dieta, alergie, potrzeby — to, co trzeba wiedzieć przed wyjazdem."
        />
      </div>
    </Modal>
  );
}
