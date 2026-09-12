import type { Metadata } from "next";
import ReservationView from "@/components/shop/ReservationView";
import FooterReveal from "@/components/layout/FooterReveal";

export const metadata: Metadata = {
  title: "Moja rezerwacja",
  description: "Szczegóły Twojej rezerwacji w Czułej Podróży.",
  robots: { index: false },
};

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <main>
      <section className="section-pad relative z-10 min-h-screen bg-ivory pb-20 pt-32">
        <ReservationView orderNumber={orderNumber} />
      </section>
      <FooterReveal />
    </main>
  );
}
