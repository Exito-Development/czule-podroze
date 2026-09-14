"use client";

import { use, useState } from "react";
import Link from "next/link";
import Badge, { orderStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { NumberField } from "@/components/ui/Field";
import { Alert, Loading } from "@/components/ui/Feedback";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { ApiError } from "@/lib/api/client";
import { cancelOrder, getOrder, markOrderPaid } from "@/lib/api/endpoints";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateTime, formatPrice, people } from "@/lib/format";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const { data: order, loading, error, reload, setData } = useAsync(
    () => getOrder(orderNumber),
    [orderNumber]
  );

  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Spinner tylko przy pierwszym wejściu; odświeżenie zostawia widoczne dane.
  if (loading && !order) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!order) return null;

  const status = orderStatus[order.status] ?? {
    label: order.status,
    tone: "neutral" as const,
  };

  const recordPayment = async () => {
    setBusy(true);
    setProblem(null);
    try {
      setData(await markOrderPaid(orderNumber, amount || undefined));
      setPayOpen(false);
    } catch (exception) {
      setProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się zapisać."
      );
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await cancelOrder(orderNumber);
      setCancelOpen(false);
      reload();
    } catch (exception) {
      setProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się anulować."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        description={
          <>
            Złożone {formatDateTime(order.createdAt)} · <Badge tone={status.tone}>{status.label}</Badge>
          </>
        }
        backHref="/zamowienia"
        backLabel="Zamówienia"
        actions={
          order.status === "PENDING_PAYMENT" ? (
            <>
              <Button
                onClick={() => {
                  setAmount(order.amountDueNow);
                  setPayOpen(true);
                }}
              >
                Zaksięguj wpłatę
              </Button>
              <Button variant="ghost" onClick={() => setCancelOpen(true)}>
                Anuluj zamówienie
              </Button>
            </>
          ) : undefined
        }
      />

      {problem && <Alert onDismiss={() => setProblem(null)}>{problem}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Pozycje" padded={false} className="lg:col-span-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Wyjazd</th>
                <th>Miejsca</th>
                <th>Forma</th>
                <th className="text-right">Zapłacone teraz</th>
                <th className="text-right">Do dopłaty</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.tripSlug}>
                  <td>
                    <Link
                      href={`/wyjazdy/${item.tripSlug}`}
                      className="font-medium hover:underline"
                    >
                      {item.tripTitle}
                    </Link>
                    <span className="block text-xs text-ink-soft">
                      {formatPrice(item.unitPrice)} za osobę
                    </span>
                  </td>
                  <td>{people(item.seats)}</td>
                  <td className="text-ink-soft">
                    {item.paymentMode === "FULL" ? "całość" : "zadatek"}
                  </td>
                  <td className="text-right">{formatPrice(item.amountDueNow)}</td>
                  <td className="text-right">{formatPrice(item.balanceDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-6">
          <Card title="Klientka">
            <dl className="space-y-2 text-sm">
              <Row label="Imię i nazwisko">
                {order.customer.firstName} {order.customer.lastName}
              </Row>
              <Row label="E-mail">
                <a href={`mailto:${order.customer.email}`} className="hover:underline">
                  {order.customer.email}
                </a>
              </Row>
              <Row label="Telefon">{order.customer.phone ?? "—"}</Row>
              {order.customer.note && <Row label="Uwagi">{order.customer.note}</Row>}
            </dl>
          </Card>

          <Card title="Rozliczenie">
            <dl className="space-y-2 text-sm">
              <Row label="Wartość wyjazdu">{formatPrice(order.tripTotal)}</Row>
              <Row label="Do zapłaty przy rezerwacji">
                {formatPrice(order.amountDueNow)}
              </Row>
              <Row label="Wpłacono">{formatPrice(order.amountPaid)}</Row>
              <Row label="Pozostaje">
                <strong>{formatPrice(order.balanceDue)}</strong>
              </Row>
              {order.status === "PENDING_PAYMENT" && (
                <Row label="Termin płatności">
                  {formatDateTime(order.paymentDeadline)}
                </Row>
              )}
              {order.paidAt && (
                <Row label="Opłacone">{formatDateTime(order.paidAt)}</Row>
              )}
            </dl>
          </Card>
        </div>
      </div>

      <Modal
        open={payOpen}
        title="Zaksięguj wpłatę"
        onClose={() => setPayOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayOpen(false)}>
              Anuluj
            </Button>
            <Button loading={busy} onClick={() => void recordPayment()}>
              Zaksięguj
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            Użyj tego, gdy klientka zapłaciła poza bramką — np. przelewem
            tradycyjnym. Miejsca zostaną przyznane na stałe, a lista uczestniczek
            uzupełni się sama.
          </p>
          <NumberField
            label="Kwota wpłaty (zł)"
            value={amount}
            onChange={setAmount}
            min={0}
            step={100}
            hint="Domyślnie kwota, której oczekiwaliśmy przy rezerwacji."
          />
        </div>
      </Modal>

      <Modal
        open={cancelOpen}
        title="Anulować zamówienie?"
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Zostaw
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void cancel()}>
              Anuluj zamówienie
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Miejsca wrócą do puli i będzie je mógł kupić ktoś inny. Klientka nie
          dostanie automatycznie żadnej wiadomości — jeśli trzeba, napisz do niej
          z zakładki „Wiadomości” przy wyjeździe.
        </p>
      </Modal>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
