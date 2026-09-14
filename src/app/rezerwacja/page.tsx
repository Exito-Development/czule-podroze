import type { Metadata } from "next";
import SavedReservationsList from "@/components/shop/SavedReservationsList";
import FooterReveal from "@/components/layout/FooterReveal";

export const metadata: Metadata = {
  title: "Moje rezerwacje",
  description: "Rezerwacje zapisane na tym urządzeniu.",
  robots: { index: false },
};

export default function ReservationsPage() {
  return (
    <main>
      <section className="section-pad relative z-10 min-h-screen bg-ivory pb-20 pt-32">
        <SavedReservationsList />
      </section>
      <FooterReveal />
    </main>
  );
}
