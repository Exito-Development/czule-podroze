"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import TripForm from "@/components/trips/TripForm";
import { createTrip } from "@/lib/api/endpoints";

export default function NewTripPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Nowy wyjazd"
        description="Plan dzień po dniu dodasz w kolejnym kroku, po zapisaniu."
        backHref="/wyjazdy"
        backLabel="Wyjazdy"
      />
      <TripForm
        submitLabel="Utwórz wyjazd"
        onSubmit={async (payload) => {
          const created = await createTrip(payload);
          router.push(`/wyjazdy/${created.slug}`);
        }}
      />
    </>
  );
}
