"use client";

import SmoothScroll from "./SmoothScroll";
import { CartProvider } from "./CartContext";
import { TripFocusProvider } from "./TripFocusContext";
import CartDrawer from "@/components/shop/CartDrawer";
import WaitlistModal from "@/components/shop/WaitlistModal";
import ContactPopup from "@/components/layout/ContactPopup";
import CookieConsent from "@/components/layout/CookieConsent";
import RouteTransition from "@/components/anim/RouteTransition";
import { getTrips } from "@/lib/data/trips";

const defaultTripSlug = getTrips()[0]?.slug ?? "";

/** Spina wszystkie globalne providery i nakładki (koszyk, modale, baner cookies). */
export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <TripFocusProvider initialSlug={defaultTripSlug}>
        <SmoothScroll>{children}</SmoothScroll>
        <CartDrawer />
        <WaitlistModal />
        <ContactPopup />
        <CookieConsent />
        <RouteTransition />
      </TripFocusProvider>
    </CartProvider>
  );
}
