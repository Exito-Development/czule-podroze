/**
 * Typy odpowiedzi API (`api/` — Spring Boot).
 *
 * Odpowiadają 1:1 DTO backendu. `TripDto` celowo pokrywa się kształtem
 * z lokalnym typem `Trip`, więc komponenty nie muszą wiedzieć, skąd
 * pochodzą dane.
 */

export interface AvailabilityDto {
  capacity: number;
  booked: number;
  /** Miejsca trzymane teraz w koszykach innych klientek. */
  held: number;
  available: number;
}

export interface TripDto {
  slug: string;
  title: string;
  tagline: string;
  continent: string;
  country: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  price: number;
  deposit: number;
  capacity: number;
  booked: number;
  status: string;
  coverImage: string;
  destinations: {
    name: string;
    dayRange: string;
    description: string;
    image: string;
  }[];
  included: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    tags?: string[];
  }[];
  availability: AvailabilityDto;
}

export type PaymentModeDto = "DEPOSIT" | "FULL";

export interface CartItemDto {
  id: string;
  tripSlug: string;
  tripTitle: string;
  coverImage: string;
  seats: number;
  paymentMode: PaymentModeDto;
  unitPrice: number;
  depositPerSeat: number;
  amountDueNow: number;
  tripTotal: number;
  /** Ile miejsc można jeszcze dołożyć poza tą pozycją. */
  seatsAvailable: number;
  holdActive: boolean;
  holdExpiresAt: string | null;
}

export interface CartDto {
  id: string;
  status: "ACTIVE" | "ORDERED" | "ABANDONED";
  items: CartItemDto[];
  totalDueNow: number;
  totalTripValue: number;
  /** Najwcześniejszy moment wygaśnięcia blokady miejsc. */
  holdExpiresAt: string | null;
}

export interface OrderItemDto {
  tripSlug: string;
  tripTitle: string;
  seats: number;
  paymentMode: PaymentModeDto;
  unitPrice: number;
  depositPerSeat: number;
  amountDueNow: number;
  tripTotal: number;
  balanceDue: number;
}

export interface OrderDto {
  orderNumber: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  currency: string;
  amountDueNow: number;
  amountPaid: number;
  tripTotal: number;
  balanceDue: number;
  paymentDeadline: string;
  paidAt: string | null;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    note?: string | null;
  };
  items: OrderItemDto[];
}

export interface PlacedOrderDto {
  order: OrderDto;
  /** Token do podglądu rezerwacji — API pokazuje go tylko raz. */
  accessToken: string;
  reservationUrl: string;
}

export interface ReservationDto {
  order: OrderDto;
  trips: TripDto[];
}

export interface PaymentSessionDto {
  paymentId: string;
  provider: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  amount: number;
  currency: string;
  /** Adres strony operatora płatności. */
  redirectUrl: string;
}

export interface WaitlistEntryDto {
  id: string;
  tripSlug: string;
  tripTitle: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  position: number;
  createdAt: string;
}
