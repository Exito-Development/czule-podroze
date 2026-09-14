"use client";

import { useState } from "react";
import Link from "next/link";
import Badge, { deliveryStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { allMessages, messageDetail } from "@/lib/api/endpoints";
import type { MessageDto } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateTime } from "@/lib/format";

/**
 * Historia wszystkich wysyłek.
 *
 * Lista nie wozi ze sobą doręczeń (bywa ich setki) — pobieramy je dopiero
 * przy otwarciu konkretnej wiadomości.
 */
export default function MessagesPage() {
  const { data, loading, error } = useAsync(() => allMessages(), []);
  const [opened, setOpened] = useState<MessageDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const open = async (message: MessageDto) => {
    setLoadingDetail(true);
    try {
      setOpened(await messageDetail(message.id));
    } catch {
      setOpened(message);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Wiadomości"
        description="Wszystko, co wyszło do uczestniczek — razem z wynikiem doręczenia."
      />

      {loading && !data && <Loading />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <Card padded={false}>
          {data.length === 0 ? (
            <EmptyState
              title="Jeszcze nic nie wysłano"
              description="Wiadomości wysyła się z karty wyjazdu, w zakładce „Wiadomości”."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Temat</th>
                    <th>Wyjazd</th>
                    <th>Grupa</th>
                    <th>Kiedy</th>
                    <th>Doręczenia</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.map((message) => (
                    <tr key={message.id}>
                      <td className="font-medium">{message.subject}</td>
                      <td>
                        <Link
                          href={`/wyjazdy/${message.tripSlug}`}
                          className="text-ink-soft hover:underline"
                        >
                          {message.tripTitle}
                        </Link>
                      </td>
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
                          loading={loadingDetail}
                          onClick={() => void open(message)}
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
      )}

      <Modal
        open={opened !== null}
        wide
        title={opened?.subject ?? ""}
        onClose={() => setOpened(null)}
      >
        <div className="space-y-5">
          <p className="text-xs text-ink-soft">
            {opened?.tripTitle} · {opened?.audienceLabel} · wysłano{" "}
            {formatDateTime(opened?.sentAt)} przez {opened?.sentBy}
          </p>
          <pre className="whitespace-pre-wrap rounded-xl bg-cream/60 p-4 font-sans text-sm">
            {opened?.body}
          </pre>
          {(opened?.deliveries ?? []).length > 0 && (
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
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
