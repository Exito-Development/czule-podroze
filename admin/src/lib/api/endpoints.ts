"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  AudienceOptionDto,
  AuthUserDto,
  MessageDto,
  OrderDto,
  RecipientPreviewDto,
  RosterDto,
  SummaryDto,
  TripDto,
  TripUpsertPayload,
  WaitlistEntryDto,
} from "@/lib/api/types";

/** Wszystkie wywołania panelu w jednym miejscu — łatwiej trzymać je zgodne z API. */

export const me = () => apiFetch<AuthUserDto>("/api/v1/auth/me");

export const summary = () => apiFetch<SummaryDto>("/api/v1/admin/summary");

// ── Wyjazdy ──────────────────────────────────────────────────────────────────

export const listTrips = () => apiFetch<TripDto[]>("/api/v1/admin/trips");

export const getTrip = (slug: string) => apiFetch<TripDto>(`/api/v1/trips/${slug}`);

export const createTrip = (payload: TripUpsertPayload) =>
  apiFetch<TripDto>("/api/v1/admin/trips", { method: "POST", body: payload });

export const updateTrip = (slug: string, payload: TripUpsertPayload) =>
  apiFetch<TripDto>(`/api/v1/admin/trips/${slug}`, { method: "PUT", body: payload });

export const replaceItinerary = (
  slug: string,
  days: { day: number; title: string; description: string; tags: string[] }[]
) =>
  apiFetch<TripDto>(`/api/v1/admin/trips/${slug}/itinerary`, {
    method: "PUT",
    body: { days },
  });

export const deleteTrip = (slug: string) =>
  apiFetch<void>(`/api/v1/admin/trips/${slug}`, { method: "DELETE" });

export const continents = () => apiFetch<string[]>("/api/v1/continents");

// ── Uczestniczki ─────────────────────────────────────────────────────────────

export const roster = (slug: string) =>
  apiFetch<RosterDto>(`/api/v1/admin/trips/${slug}/participants`);

export const rosterCsv = (slug: string) =>
  apiFetch<string>(`/api/v1/admin/trips/${slug}/participants/csv`, { raw: true });

export const updateParticipant = (
  id: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    note?: string;
  }
) => apiFetch<unknown>(`/api/v1/admin/participants/${id}`, { method: "PUT", body: payload });

export const cancelParticipant = (id: string) =>
  apiFetch<unknown>(`/api/v1/admin/participants/${id}/cancel`, { method: "POST" });

export const restoreParticipant = (id: string) =>
  apiFetch<unknown>(`/api/v1/admin/participants/${id}/restore`, { method: "POST" });

// ── Zamówienia ───────────────────────────────────────────────────────────────

export const listOrders = () => apiFetch<OrderDto[]>("/api/v1/admin/orders");

export const getOrder = (orderNumber: string) =>
  apiFetch<OrderDto>(`/api/v1/admin/orders/${orderNumber}`);

export const markOrderPaid = (orderNumber: string, amount?: number) =>
  apiFetch<OrderDto>(`/api/v1/admin/orders/${orderNumber}/mark-paid`, {
    method: "POST",
    body: amount === undefined ? {} : { amount },
  });

export const cancelOrder = (orderNumber: string) =>
  apiFetch<void>(`/api/v1/admin/orders/${orderNumber}/cancel`, { method: "POST" });

// ── Wiadomości ───────────────────────────────────────────────────────────────

export const messageAudiences = (slug: string) =>
  apiFetch<AudienceOptionDto[]>(`/api/v1/admin/trips/${slug}/messages/audiences`);

export const previewRecipients = (slug: string, audience: string) =>
  apiFetch<RecipientPreviewDto>(
    `/api/v1/admin/trips/${slug}/messages/preview?audience=${encodeURIComponent(audience)}`
  );

export const sendMessage = (
  slug: string,
  payload: { audience: string; subject: string; body: string }
) => apiFetch<MessageDto>(`/api/v1/admin/trips/${slug}/messages`, { method: "POST", body: payload });

export const tripMessages = (slug: string) =>
  apiFetch<MessageDto[]>(`/api/v1/admin/trips/${slug}/messages`);

export const allMessages = () => apiFetch<MessageDto[]>("/api/v1/admin/messages");

export const messageDetail = (id: string) =>
  apiFetch<MessageDto>(`/api/v1/admin/messages/${id}`);

// ── Lista rezerwowa ──────────────────────────────────────────────────────────

export const waitlist = (slug?: string) =>
  apiFetch<WaitlistEntryDto[]>(
    slug ? `/api/v1/admin/waitlist?tripSlug=${encodeURIComponent(slug)}` : "/api/v1/admin/waitlist"
  );
