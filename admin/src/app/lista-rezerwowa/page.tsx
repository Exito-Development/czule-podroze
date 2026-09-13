"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, Loading } from "@/components/ui/Feedback";
import PageHeader from "@/components/ui/PageHeader";
import { waitlist } from "@/lib/api/endpoints";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateTime } from "@/lib/format";

export default function WaitlistPage() {
  const { data, loading, error } = useAsync(() => waitlist(), []);

  return (
    <>
      <PageHeader
        title="Lista rezerwowa"
        description="Osoby, które czekają na zwolnione miejsce."
      />

      {loading && !data && <Loading />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <Card padded={false}>
          {data.length === 0 ? (
            <EmptyState
              title="Nikt nie czeka"
              description="Zapisy pojawią się tu, gdy któryś wyjazd się zapełni."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kolejka</th>
                    <th>Osoba</th>
                    <th>Kontakt</th>
                    <th>Wyjazd</th>
                    <th>Zapisana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <Badge tone={entry.position === 1 ? "warning" : "neutral"}>
                          {entry.position}.
                        </Badge>
                      </td>
                      <td className="font-medium">{entry.name}</td>
                      <td className="text-ink-soft">
                        <a href={`mailto:${entry.email}`} className="hover:underline">
                          {entry.email}
                        </a>
                        {entry.phone && (
                          <span className="block text-xs">{entry.phone}</span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/wyjazdy/${entry.tripSlug}`}
                          className="hover:underline"
                        >
                          {entry.tripTitle}
                        </Link>
                      </td>
                      <td className="text-ink-soft">{formatDateTime(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <p className="mt-4 text-xs text-ink-faint">
        Żeby napisać do osób z listy rezerwowej, wejdź w wyjazd → zakładka
        „Wiadomości” i wybierz grupę „Lista rezerwowa”.
      </p>
    </>
  );
}
