"use client";

import SmoothScroll from "./SmoothScroll";
import { CartProvider } from "./CartContext";
import CartDrawer from "@/components/shop/CartDrawer";
import WaitlistModal from "@/components/shop/WaitlistModal";
import ContactPopup from "@/components/layout/ContactPopup";
import CookieConsent from "@/components/layout/CookieConsent";

/** Spina wszystkie globalne providery i nakładki (koszyk, modale, baner cookies). */
export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SmoothScroll>{children}</SmoothScroll>
      <CartDrawer />
      <WaitlistModal />
      <ContactPopup />
      <CookieConsent />
    </CartProvider>
  );
}
