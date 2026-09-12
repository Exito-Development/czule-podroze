import { apiRequest } from "@/lib/api/client";
import type {
  PaymentSessionDto,
  PlacedOrderDto,
  ReservationDto,
} from "@/lib/api/types";

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  note?: string;
}

export function placeOrder(input: {
  cartId: string;
  customer: CustomerInput;
  acceptTerms: boolean;
}): Promise<PlacedOrderDto> {
  return apiRequest<PlacedOrderDto>("/api/v1/orders", {
    method: "POST",
    body: input,
  });
}

/** Zakłada sesję płatności i zwraca adres operatora do przekierowania. */
export function startPayment(input: {
  orderNumber: string;
  accessToken: string;
}): Promise<PaymentSessionDto> {
  return apiRequest<PaymentSessionDto>("/api/v1/payments", {
    method: "POST",
    body: input,
  });
}

export function getReservation(
  orderNumber: string,
  accessToken: string
): Promise<ReservationDto> {
  return apiRequest<ReservationDto>(
    `/api/v1/reservations/${encodeURIComponent(orderNumber)}`,
    {
      cache: "no-store",
      headers: { "X-Reservation-Token": accessToken },
    }
  );
}
