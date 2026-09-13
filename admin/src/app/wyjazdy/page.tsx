"use client";

import Link from "next/link";
import Badge, { tripStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";
import PageHeader from "@/components/ui/PageHeader";
import { listTrips } from "@/lib/api/endpoints";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateRange, formatPrice } from "@/lib/format";

export default function TripsPage() {
  const { data, loading, error } = useAsync(() => listTrips(), []);

  return (
    <>
      <PageHeader
        title="Wyjazdy"
        description="Cała oferta — także wyjazdy jeszcze nieopublikowane."
        actions={
          <Link href="/wyjazdy/nowy">
            <Button>Nowy wyjazd</Button>
          </Link>
        }
      />

      {loading && !data && <Loading />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <Card padded={false}>
          {data.length === 0 ? (
            <EmptyState
              title="Nie ma jeszcze żadnego wyjazdu"
              description="Dodaj pierwszy, żeby pojawił się na stronie."
              action={
                <Link href="/wyjazdy/nowy">
                  <Button>Dodaj wyjazd</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Wyjazd</th>
                    <th>Termin</th>
                    <th>Cena</th>
                    <th>Miejsca</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.map((trip) => {
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
                          <span className="block text-xs text-ink-soft">
                            {trip.continent} · {trip.country} · plan na{" "}
                            {trip.itinerary.length} dni
                          </span>
                        </td>
                        <td className="text-ink-soft">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </td>
                        <td>
                          {formatPrice(trip.price)}
                          <span className="block text-xs text-ink-faint">
                            zadatek {formatPrice(trip.deposit)}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium">
                            {trip.availability.booked}/{trip.capacity}
                          </span>
                          {trip.availability.held > 0 && (
                            <span className="block text-xs text-ink-faint">
                              {trip.availability.held} w koszykach
                            </span>
                          )}
                        </td>
                        <td>
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                        <td className="text-right">
                          <Link href={`/wyjazdy/${trip.slug}`}>
                            <Button variant="secondary" size="sm">
                              Otwórz
                            </Button>
                          </Link>
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
