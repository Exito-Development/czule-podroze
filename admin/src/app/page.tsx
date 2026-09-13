"use client";

import Link from "next/link";
import { summary } from "@/lib/api/endpoints";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDate, formatPrice, seats } from "@/lib/format";
import Badge, { orderStatus, tripStatus } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";

export default function DashboardPage() {
  const { data, loading, error } = useAsync(() => summary(), []);

  // Spinner tylko przy pierwszym wejściu; odświeżenie zostawia widoczne dane.
  if (loading && !data) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!data) return null;

  const fillRate =
    data.seatsCapacity === 0
      ? 0
      : Math.round((data.seatsSold / data.seatsCapacity) * 100);

  return (
    <>
      <PageHeader
        title="Pulpit"
        description="Stan sprzedaży wszystkich wyjazdów."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Sprzedane miejsca"
          value={`${data.seatsSold} / ${data.seatsCapacity}`}
          hint={`${fillRate}% zapełnienia`}
        />
        <Stat
          label="Wpłacone"
          value={formatPrice(data.revenuePaid)}
          hint={`${data.ordersConfirmed} opłaconych rezerwacji`}
        />
        <Stat
          label="Do dopłaty"
          value={formatPrice(data.outstandingBalance)}
          hint="przed wyjazdami"
          tone={data.outstandingBalance > 0 ? "warning" : "neutral"}
        />
        <Stat
          label="Wymaga uwagi"
          value={`${data.ordersPendingPayment + data.participantsIncomplete}`}
          hint={`${data.ordersPendingPayment} czeka na płatność · ${data.participantsIncomplete} bez danych`}
          tone={
            data.ordersPendingPayment + data.participantsIncomplete > 0
              ? "warning"
              : "neutral"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card
          title="Wyjazdy"
          description="Zapełnienie i przychód z każdego wyjazdu."
          padded={false}
          className="xl:col-span-3"
        >
          {data.trips.length === 0 ? (
            <EmptyState
              title="Brak wyjazdów"
              description="Dodaj pierwszy wyjazd, żeby ruszyć ze sprzedażą."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Wyjazd</th>
                    <th>Termin</th>
                    <th>Miejsca</th>
                    <th>Rezerwowa</th>
                    <th className="text-right">Wpłacone</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trips.map((trip) => {
                    const status = tripStatus[trip.status] ?? {
                      label: trip.status,
                      tone: "neutral" as const,
                    };
                    return (
                      <tr key={trip.slug}>
                        <td>
                          <Link
                            href={`/wyjazdy/${trip.slug}`}
                            className="font-medium hover:underline"
                          >
                            {trip.title}
                          </Link>
                          <div className="mt-1">
                            <Badge tone={status.tone}>{status.label}</Badge>
                          </div>
                        </td>
                        <td className="text-ink-soft">{formatDate(trip.startDate)}</td>
                        <td>
                          <span className="font-medium">
                            {trip.seatsSold}/{trip.capacity}
                          </span>
                          {trip.seatsHeld > 0 && (
                            <span className="block text-xs text-ink-faint">
                              {trip.seatsHeld} w koszykach
                            </span>
                          )}
                        </td>
                        <td className="text-ink-soft">{trip.waitlist || "—"}</td>
                        <td className="text-right">{formatPrice(trip.revenuePaid)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Ostatnie zamówienia"
          padded={false}
          className="xl:col-span-2"
          action={
            <Link
              href="/zamowienia"
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Wszystkie →
            </Link>
          }
        >
          {data.recentOrders.length === 0 ? (
            <EmptyState title="Jeszcze nikt nic nie zarezerwował" />
          ) : (
            <ul className="divide-y divide-ink/6">
              {data.recentOrders.map((order) => {
                const status = orderStatus[order.status] ?? {
                  label: order.status,
                  tone: "neutral" as const,
                };
                return (
                  <li key={order.orderNumber} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/zamowienia/${order.orderNumber}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {order.customerName}
                        </Link>
                        <p className="truncate text-xs text-ink-soft">
                          {order.trips.join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <p className="mt-1 text-xs text-ink-soft">
                          {formatPrice(
                            order.status === "CONFIRMED"
                              ? order.amountPaid
                              : order.amountDueNow
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-ink-faint">
        Łącznie {seats(data.seatsCapacity)} w ofercie · {data.tripsPublished}{" "}
        opublikowanych wyjazdów · {data.waitlistWaiting} osób na listach rezerwowych.
      </p>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "warning";
}) {
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-ink/8">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p
        className={`mt-2 font-serif text-2xl ${
          tone === "warning" ? "text-danger" : ""
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
