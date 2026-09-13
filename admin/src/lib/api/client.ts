"use client";

import type { TokenResponseDto } from "@/lib/api/types";

const REFRESH_STORAGE_KEY = "czula-admin-refresh";

/** Token dostępowy trzymamy wyłącznie w pamięci — nie zostaje po zamknięciu karty. */
let accessToken: string | null = null;

/**
 * Jedno odświeżenie naraz.
 *
 * Backend rotuje tokeny odświeżające i traktuje ponowne użycie zużytego tokenu
 * jako kradzież — unieważnia wtedy całą sesję. Gdyby dwa równoległe żądania
 * dostały 401 i każde ruszyło po własne odświeżenie, drugie wysłałoby token
 * już zużyty i wylogowałoby organizatorkę w środku pracy. Dlatego wszystkie
 * czekają na to samo odświeżenie.
 */
let refreshInFlight: Promise<string> | null = null;

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: { field: string; message: string }[];

  constructor(
    status: number,
    body: { code?: string; message?: string; fieldErrors?: { field: string; message: string }[] }
  ) {
    super(body.message ?? "Coś poszło nie tak. Spróbuj ponownie.");
    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? "server.error";
    this.fieldErrors = body.fieldErrors ?? [];
  }
}

/** Sesja wygasła albo została unieważniona — trzeba zalogować się ponownie. */
export class SessionExpiredError extends Error {
  constructor() {
    super("Sesja wygasła — zaloguj się ponownie.");
    this.name = "SessionExpiredError";
  }
}

export function storeSession(tokens: TokenResponseDto): void {
  accessToken = tokens.accessToken;
  try {
    localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refreshToken);
  } catch {
    /* tryb prywatny — sesja przeżyje tylko tę kartę */
  }
}

export function clearSession(): void {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  } catch {
    /* nic nie szkodzi */
  }
}

export function storedRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function hasAccessToken(): boolean {
  return accessToken !== null;
}

async function request(
  path: string,
  init: RequestInit,
  token: string | null
): Promise<Response> {
  return fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = storedRefreshToken();
      if (!refreshToken) {
        throw new SessionExpiredError();
      }
      const response = await request(
        "/api/v1/auth/refresh",
        { method: "POST", body: JSON.stringify({ refreshToken }) },
        null
      );
      if (!response.ok) {
        throw new SessionExpiredError();
      }
      const tokens = (await response.json()) as TokenResponseDto;
      storeSession(tokens);
      return tokens.accessToken;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Odpowiedź nie jest JSON-em (np. eksport CSV). */
  raw?: boolean;
}

/**
 * Wywołanie API z automatycznym odświeżeniem sesji.
 *
 * Na 401 próbujemy raz odświeżyć token i powtórzyć żądanie; dopiero gdy to się
 * nie uda, zgłaszamy {@link SessionExpiredError}.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, raw, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    body: body === undefined ? undefined : JSON.stringify(body),
  };

  let response = await request(path, init, accessToken);

  if (response.status === 401) {
    const fresh = await refreshAccessToken();
    response = await request(path, init, fresh);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (raw) {
    if (!response.ok) {
      throw new ApiError(response.status, {});
    }
    return (await response.text()) as T;
  }

  const text = await response.text();
  const parsed = text ? safeJson(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, (parsed as Record<string, never>) ?? {});
  }
  return parsed as T;
}

/** Logowanie — jedyne wywołanie, które nie potrzebuje sesji. */
export async function login(
  email: string,
  password: string
): Promise<TokenResponseDto> {
  const response = await request(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    null
  );
  const text = await response.text();
  const parsed = text ? safeJson(text) : undefined;
  if (!response.ok) {
    throw new ApiError(response.status, (parsed as Record<string, never>) ?? {});
  }
  const tokens = parsed as TokenResponseDto;
  storeSession(tokens);
  return tokens;
}

/** Odtworzenie sesji po odświeżeniu strony — token dostępowy żyje tylko w pamięci. */
export async function restoreSession(): Promise<string> {
  return refreshAccessToken();
}

export async function logout(): Promise<void> {
  const refreshToken = storedRefreshToken();
  clearSession();
  if (!refreshToken) {
    return;
  }
  await request(
    "/api/v1/auth/logout",
    { method: "POST", body: JSON.stringify({ refreshToken }) },
    null
  ).catch(() => {
    /* wylogowanie lokalne i tak już nastąpiło */
  });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
