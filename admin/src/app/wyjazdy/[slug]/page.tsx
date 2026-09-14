"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Badge, { tripStatus } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Alert, Loading } from "@/components/ui/Feedback";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import ItineraryEditor from "@/components/trips/ItineraryEditor";
import MessagesTab from "@/components/trips/MessagesTab";
import ParticipantsTab from "@/components/trips/ParticipantsTab";
import TripForm from "@/components/trips/TripForm";
import { ApiError } from "@/lib/api/client";
import { deleteTrip, getTrip, updateTrip } from "@/lib/api/endpoints";
import { useAsync } from "@/lib/hooks/useAsync";
import { formatDateRange } from "@/lib/format";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: trip, loading, error, reload } = useAsync(() => getTrip(slug), [slug]);
  const [tab, setTab] = useState("dane");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteProblem, setDeleteProblem] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Spinner tylko przy pierwszym wejściu; odświeżenie zostawia widoczne dane.
  if (loading && !trip) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!trip) return null;

  const status = tripStatus[trip.status] ?? {
    label: trip.status,
    tone: "neutral" as const,
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteProblem(null);
    try {
      await deleteTrip(slug);
      router.push("/wyjazdy");
    } catch (exception) {
      setDeleteProblem(
        exception instanceof ApiError ? exception.message : "Nie udało się usunąć."
      );
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={trip.title}
        description={
          <>
            {formatDateRange(trip.startDate, trip.endDate)} · {trip.country} ·{" "}
            <Badge tone={status.tone}>{status.label}</Badge>
          </>
        }
        backHref="/wyjazdy"
        backLabel="Wyjazdy"
        actions={
          <>
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}/wyjazdy/${trip.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="secondary">Zobacz na stronie ↗</Button>
            </a>
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Usuń
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: "dane", label: "Dane wyjazdu" },
          { id: "plan", label: "Plan dzień po dniu", badge: trip.itinerary.length },
          { id: "uczestnicy", label: "Uczestniczki", badge: trip.availability.booked },
          { id: "wiadomosci", label: "Wiadomości" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "dane" && (
        <TripForm
          trip={trip}
          submitLabel="Zapisz zmiany"
          onSubmit={async (payload) => {
            await updateTrip(slug, payload);
            reload();
          }}
        />
      )}

      {tab === "plan" && (
        <ItineraryEditor slug={slug} itinerary={trip.itinerary} onSaved={reload} />
      )}

      {tab === "uczestnicy" && <ParticipantsTab slug={slug} />}

      {tab === "wiadomosci" && <MessagesTab slug={slug} />}

      <Modal
        open={confirmDelete}
        title="Usunąć wyjazd?"
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Zostaw
            </Button>
            <Button variant="danger" loading={deleting} onClick={() => void remove()}>
              Usuń wyjazd
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {deleteProblem && <Alert>{deleteProblem}</Alert>}
          <p className="text-sm text-ink-soft">
            Usuniemy <strong>{trip.title}</strong> razem z planem i destynacjami.
            Tej operacji nie da się cofnąć.
          </p>
          <p className="text-sm text-ink-soft">
            Jeśli na wyjazd są już rezerwacje, usunięcie się nie powiedzie — wtedy
            zamiast usuwać, cofnij publikację w zakładce „Dane wyjazdu”.
          </p>
        </div>
      </Modal>
    </>
  );
}
