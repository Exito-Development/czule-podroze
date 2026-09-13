/**
 * Typy odpowiedzi API panelu.
 *
 * Uwaga: backend pomija pola puste (`default-property-inclusion: non_null`),
 * więc wszystko, co może być puste, jest tu opcjonalne — inaczej TypeScript
 * obiecywałby wartości, których w JSON-ie po prostu nie ma.
 */

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
  destinations: TripDestinationDto[];
  included: string[];
  itinerary: TripDayDto[];
  availability: {
    capacity: number;
    booked: number;
    held: number;
    available: number;
  };
}

export interface TripDestinationDto {
  name: string;
  dayRange: string;
  description: string;
  image: string;
}

export interface TripDayDto {
  day: number;
  title: string;
  description: string;
  tags?: string[];
}

export interface TripUpsertPayload {
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
  coverImage: string;
  published: boolean;
  /**
   * Sekcje opcjonalne: ich pominięcie zostawia zapisaną wersję nietkniętą,
   * a pusta tablica czyści sekcję. Dzięki temu zapis samych danych wyjazdu
   * nie kasuje planu dzień po dniu edytowanego w osobnej zakładce.
   */
  included?: string[];
  destinations?: {
    position: number;
    name: string;
    dayRange: string;
    description: string;
    image: string;
  }[];
  itinerary?: { day: number; title: string; description: string; tags: string[] }[];
}

export interface ParticipantDto {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  note?: string;
  contactPerson: boolean;
  incomplete: boolean;
  status: "CONFIRMED" | "CANCELLED";
  seatNumber: number;
  orderNumber: string;
  orderStatus: string;
  paymentMode?: string;
  balanceDue: number;
  bookedByName: string;
  bookedByEmail: string;
}

export interface RosterDto {
  tripSlug: string;
  tripTitle: string;
  capacity: number;
  seatsSold: number;
  seatsPending: number;
  seatsAvailable: number;
  incomplete: number;
  balanceDue: number;
  participants: ParticipantDto[];
}

export interface OrderItemDto {
  tripSlug: string;
  tripTitle: string;
  seats: number;
  paymentMode: string;
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
  paidAt?: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    note?: string;
  };
  items: OrderItemDto[];
}

export interface SummaryDto {
  tripsPublished: number;
  tripsUpcoming: number;
  seatsSold: number;
  seatsCapacity: number;
  ordersConfirmed: number;
  ordersPendingPayment: number;
  revenuePaid: number;
  outstandingBalance: number;
  waitlistWaiting: number;
  participantsIncomplete: number;
  trips: SummaryTripRowDto[];
  recentOrders: SummaryOrderRowDto[];
}

export interface SummaryTripRowDto {
  slug: string;
  title: string;
  startDate: string;
  status: string;
  capacity: number;
  seatsSold: number;
  seatsHeld: number;
  seatsAvailable: number;
  waitlist: number;
  revenuePaid: number;
  outstandingBalance: number;
}

export interface SummaryOrderRowDto {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  amountDueNow: number;
  amountPaid: number;
  createdAt: string;
  trips: string[];
}

export interface AudienceOptionDto {
  value: string;
  label: string;
  count: number;
}

export interface RecipientPreviewDto {
  audience: string;
  audienceLabel: string;
  count: number;
  recipients: { name: string; email: string }[];
}

export interface MessageDto {
  id: string;
  tripSlug: string;
  tripTitle: string;
  subject: string;
  body: string;
  audience: string;
  audienceLabel: string;
  sentBy: string;
  sentAt: string;
  recipientCount: number;
  failedCount: number;
  provider: string;
  deliveries: MessageDeliveryDto[];
}

export interface MessageDeliveryDto {
  recipientName?: string;
  recipientEmail: string;
  status: "SENT" | "FAILED";
  failureReason?: string;
}

export interface WaitlistEntryDto {
  id: string;
  tripSlug: string;
  tripTitle: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  position: number;
  createdAt: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshTokenExpiresAt: string;
  user: AuthUserDto;
}
