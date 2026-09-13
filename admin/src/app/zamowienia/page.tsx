"use client";

import { useState } from "react";
import Link from "next/link";
import Badge, { orderStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";
import PageHeader from "@/components/ui/PageHeader";
import { listOrders } from "@/lib/api/endpoints";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateTime, formatPrice } from "@/lib/format";
import { clsx } from "@/lib/clsx";

const FILTERS = [
  { id: "ALL", label: "Wszystkie" },
  { id: "PENDING_PAYMENT", label: "Czekają na płatność" },
  { id: "CONFIRMED", label: "Opłacone" },
  { id: "CANCELLED", label: "Anulowane" },
  { id: "EXPIRED", label: "Wygasłe" },
];

export default function OrdersPage() {
  const { data, loading, error } = useAsync(() => listOrders(), []);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const visible = (data ?? []).filter((order) => {
    if (filter !== "ALL" && order.status !== filter) return false;
    if (search.trim() === "") return true;
    const needle = search.trim().toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(needle) ||
      order.customer.email.toLowerCase().includes(needle) ||
      `${order.customer.firstName} ${order.customer.lastName}`
        .toLowerCase()
        .includes(needle)
    );
  });

  return (
    <>
      <PageHeader title="Zamówienia" description="Wszystkie rezerwacje, od najnowszych." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                filter === option.id
                  ? "bg-sage text-white"
                  : "bg-surface text-ink-soft ring-1 ring-ink/10 hover:bg-cream"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Szukaj po numerze, nazwisku lub e-mailu…"
          className="field-input ml-auto max-w-xs"
        />
      </div>

      {loading && !data && <Loading />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <Card padded={false}>
          {visible.length === 0 ? (
            <EmptyState
              title="Nic tu nie ma"
              description={
                data.length === 0
                  ? "Nikt jeszcze nie złożył zamówienia."
                  : "Żadne zamówienie nie pasuje do filtrów."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Numer</th>
                    <th>Klientka</th>
                    <th>Wyjazd</th>
                    <th>Złożone</th>
                    <th className="text-right">Kwota</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => {
                    const status = orderStatus[order.status] ?? {
                      label: order.status,
                      tone: "neutral" as const,
                    };
                    return (
                      <tr key={order.orderNumber}>
                        <td>
                          <Link
                            href={`/zamowienia/${order.orderNumber}`}
                            className="font-medium hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td>
                          {order.customer.firstName} {order.customer.lastName}
                          <span className="block text-xs text-ink-soft">
                            {order.customer.email}
                          </span>
                        </td>
                        <td className="text-ink-soft">
                          {order.items.map((item) => (
                            <span key={item.tripSlug} className="block">
                              {item.tripTitle} · {item.seats}×
                            </span>
                          ))}
                        </td>
                        <td className="text-ink-soft">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="text-right">
                          {formatPrice(
                            order.status === "CONFIRMED"
                              ? order.amountPaid
                              : order.amountDueNow
                          )}
                          {order.balanceDue > 0 && order.status === "CONFIRMED" && (
                            <span className="block text-xs text-ink-faint">
                              dopłata {formatPrice(order.balanceDue)}
                            </span>
                          )}
                        </td>
                        <td>
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
