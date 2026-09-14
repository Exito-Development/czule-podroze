import { apiRequest } from "@/lib/api/client";
import type { CartDto, PaymentModeDto } from "@/lib/api/types";

/** Koszyk żyje po stronie API; przeglądarka trzyma tylko jego identyfikator. */
export function createCart(): Promise<CartDto> {
  return apiRequest<CartDto>("/api/v1/carts", { method: "POST" });
}

export function getCart(cartId: string): Promise<CartDto> {
  return apiRequest<CartDto>(`/api/v1/carts/${cartId}`, { cache: "no-store" });
}

export function addCartItem(
  cartId: string,
  input: { tripSlug: string; seats: number; paymentMode: PaymentModeDto }
): Promise<CartDto> {
  return apiRequest<CartDto>(`/api/v1/carts/${cartId}/items`, {
    method: "POST",
    body: input,
  });
}

export function updateCartItem(
  cartId: string,
  itemId: string,
  input: { seats: number; paymentMode?: PaymentModeDto }
): Promise<CartDto> {
  return apiRequest<CartDto>(`/api/v1/carts/${cartId}/items/${itemId}`, {
    method: "PATCH",
    body: input,
  });
}

export function removeCartItem(cartId: string, itemId: string): Promise<CartDto> {
  return apiRequest<CartDto>(`/api/v1/carts/${cartId}/items/${itemId}`, {
    method: "DELETE",
  });
}

/** Odnawia blokady miejsc — wołane przed przejściem do kasy. */
export function refreshCart(cartId: string): Promise<CartDto> {
  return apiRequest<CartDto>(`/api/v1/carts/${cartId}/refresh`, {
    method: "POST",
  });
}
