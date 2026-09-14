"use client";

import { useState } from "react";
import Badge, { deliveryStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";
import Modal from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import {
  messageAudiences,
  previewRecipients,
  sendMessage,
  tripMessages,
} from "@/lib/api/endpoints";
import type { MessageDto, RecipientPreviewDto } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateTime, peopleGenitive } from "@/lib/format";
import { clsx } from "@/lib/clsx";

const PLACEHOLDERS = [
  { token: "{{imie}}", description: "imię odbiorczyni" },
  { token: "{{wyjazd}}", description: "nazwa wyjazdu" },
  { token: "{{numer_rezerwacji}}", description: "numer rezerwacji" },
  { token: "{{do_doplaty}}", description: "kwota do dopłaty" },
];

/**
 * Wiadomości do uczestniczek wyjazdu.
 *
 * Zanim cokolwiek wyjdzie, pokazujemy dokładnie kto to dostanie — wysyłka
 * do trzydziestu osób to nie jest operacja, którą chce się cofać.
 */
export default function MessagesTab({ slug }: { slug: string }) {
  const audiences = useAsync(() => messageAudiences(slug), [slug]);
  const history = useAsync(() => tripMessages(slug), [slug]);

  const [audience, setAudience] = useState("PARTICIPANTS");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [sent, setSent] = useState<MessageDto | null>(null);
  const [preview, setPreview] = useState<RecipientPreviewDto | null>(null);
  const [opened, setOpened] = useState<MessageDto | null>(null);

  const selected = audiences.data?.find((option) => option.value === audience);

  const showPreview = async () => {
    setProblem(null);
    try {
      setPreview(await previewRecipients(slug, audience));
    } catch (exception) {
      setProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się pobrać listy."
      );
    }
  };

  const send = async () => {
    setProblem(null);
    setBusy(true);
    try {
      const message = await sendMessage(slug, { audience, subject, body });
      setSent(message);
      setSubject("");
      setBody("");
      setPreview(null);
      audiences.reload();
      history.reload();
    } catch (exception) {
      setProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się wysłać."
      );
    } finally {
      setBusy(false);
    }
  };

  const canSend =
    subject.trim() !== "" && body.trim() !== "" && (selected?.count ?? 0) > 0;

  return (
    <div className="space-y-6">
      {problem && <Alert onDismiss={() => setProblem(null)}>{problem}</Alert>}
      {sent && (
        <Alert tone="success" onDismiss={() => setSent(null)}>
          Wysłano do {peopleGenitive(sent.recipientCount)}
          {sent.failedCount > 0 && ` — ${sent.failedCount} nie doszło`}.{" "}
          <button className="underline" onClick={() => setOpened(sent)}>
            Zobacz szczegóły
          </button>
        </Alert>
      )}

      <Card title="Nowa wiadomość" description="Trafi na adresy e-mail wybranej grupy.">
        <div className="space-y-5">
          <div>
            <span className="field-label">Do kogo</span>
            {audiences.loading ? (
              <Loading label="Liczymy odbiorczynie…" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(audiences.data ?? []).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setAudience(option.value);
                      setPreview(null);
                    }}
                    disabled={option.count === 0}
                    className={clsx(
                      "rounded-full px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      option.value === audience
                        ? "bg-sage text-white"
                        : "bg-cream text-ink-soft hover:bg-sand"
                    )}
                  >
                    {option.label}
                    <span className="ml-2 opacity-70">{option.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <TextField
            label="Temat"
            value={subject}
            onChange={setSubject}
            placeholder="np. Zbiórka na lotnisku"
            required
          />

          <TextAreaField
            label="Treść"
            value={body}
            onChange={setBody}
            rows={8}
            required
            placeholder={"Cześć {{imie}}!\n\nPrzypominamy, że…"}
          />

          <div className="rounded-xl bg-cream/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">
              Możesz wstawić
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLACEHOLDERS.map((placeholder) => (
                <button
                  key={placeholder.token}
                  type="button"
                  onClick={() => setBody((current) => `${current}${placeholder.token}`)}
                  className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-ink/10 transition-colors hover:bg-sand"
                  title={placeholder.description}
                >
                  {placeholder.token}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Podstawimy je przy wysyłce — każda dostanie swoją wersję. Podpis
              organizatorek dokleja się automatycznie.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => void showPreview()}>
              Kto to dostanie?
            </Button>
            <Button loading={busy} disabled={!canSend} onClick={() => void send()}>
              Wyślij do {selected?.count ?? 0}{" "}
              {selected?.count === 1 ? "osoby" : "osób"}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Historia wysyłek" padded={false}>
        {history.loading ? (
          <Loading />
        ) : (history.data ?? []).length === 0 ? (
          <EmptyState title="Jeszcze nic nie wysłano" />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Temat</th>
                  <th>Grupa</th>
                  <th>Kiedy</th>
                  <th>Doręczenia</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(history.data ?? []).map((message) => (
                  <tr key={message.id}>
                    <td className="font-medium">{message.subject}</td>
                    <td className="text-ink-soft">{message.audienceLabel}</td>
                    <td className="text-ink-soft">{formatDateTime(message.sentAt)}</td>
                    <td>
                      {message.recipientCount - message.failedCount}/
                      {message.recipientCount}
                      {message.failedCount > 0 && (
                        <Badge tone="danger" className="ml-2">
                          {message.failedCount} błędów
                        </Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpened(message)}
                      >
                        Podgląd
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={preview !== null}
        title={`Odbiorczynie: ${preview?.audienceLabel ?? ""}`}
        onClose={() => setPreview(null)}
      >
        {preview?.count === 0 ? (
          <p className="text-sm text-ink-soft">
            W tej grupie nie ma nikogo z adresem e-mail.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {preview?.recipients.map((recipient) => (
              <li
                key={recipient.email}
                className="flex justify-between gap-3 border-b border-ink/6 pb-2 last:border-0"
              >
                <span>{recipient.name}</span>
                <span className="text-ink-soft">{recipient.email}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        open={opened !== null}
        wide
        title={opened?.subject ?? ""}
        onClose={() => setOpened(null)}
      >
        <div className="space-y-5">
          <p className="text-xs text-ink-soft">
            {opened?.audienceLabel} · wysłano {formatDateTime(opened?.sentAt)} przez{" "}
            {opened?.sentBy} · kanał: {opened?.provider}
          </p>
          <pre className="whitespace-pre-wrap rounded-xl bg-cream/60 p-4 font-sans text-sm">
            {opened?.body}
          </pre>
          <div>
            <p className="field-label">Doręczenia</p>
            <ul className="space-y-1.5 text-sm">
              {(opened?.deliveries ?? []).map((delivery, index) => {
                const status = deliveryStatus[delivery.status];
                return (
                  <li key={index} className="flex items-center justify-between gap-3">
                    <span className="text-ink-soft">
                      {delivery.recipientName} &lt;{delivery.recipientEmail}&gt;
                    </span>
                    <span className="flex items-center gap-2">
                      {delivery.failureReason && (
                        <span className="text-xs text-danger">
                          {delivery.failureReason}
                        </span>
                      )}
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
