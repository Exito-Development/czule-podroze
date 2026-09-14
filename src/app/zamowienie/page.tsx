import type { Metadata } from "next";
import CheckoutView from "@/components/shop/CheckoutView";
import FooterReveal from "@/components/layout/FooterReveal";

export const metadata: Metadata = {
  title: "Rezerwacja",
  description: "Dokończ rezerwację miejsca na wyjeździe Czułej Podróży.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main>
      <section className="section-pad relative z-10 min-h-screen bg-ivory pb-20 pt-32">
        <CheckoutView />
      </section>
      <FooterReveal />
    </main>
  );
}
