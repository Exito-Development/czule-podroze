/**
 * Cienki klient REST do backendu (`api/`).
 *
 * Dwie rzeczy, na których nam zależy:
 *  - błędy API mają w sobie `code` (np. `seats.unavailable`), więc UI może
 *    zareagować na sytuację, a nie na treść komunikatu;
 *  - brak backendu nie wywraca strony — rozróżniamy „API odpowiedziało błędem"
 *    (ApiError) od „nie dało się połączyć" (ApiUnavailableError), żeby
 *    prezentacja oferty działała także bez uruchomionego API.
 */

const DEFAULT_BASE_URL = "http://localhost:8080";

/** Adres API: w przeglądarce publiczny, po stronie serwera może być wewnętrzny. */
export function apiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL;
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
  fieldErrors?: { field: string; message: string }[];
}

/** API odpowiedziało, ale odmówiło — mamy kod i komunikat dla użytkowniczki. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly fieldErrors: { field: string; message: string }[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? "Coś poszło nie tak. Spróbuj ponownie za chwilę.");
    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? "server.error";
    this.details = body.details ?? {};
    this.fieldErrors = body.fieldErrors ?? [];
  }
}

/** Nie udało się w ogóle dobić do API (brak sieci, backend nie działa). */
export class ApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Nie udało się połączyć z serwerem rezerwacji.");
    this.name = "ApiUnavailableError";
    this.cause = cause;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Opcje cache Next.js (ISR) dla zapytań po stronie serwera. */
  next?: { revalidate?: number; tags?: string[] };
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, next, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...rest,
      next,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw new ApiUnavailableError(cause);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.text();
  const parsed = payload ? safeJson(payload) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, (parsed as ApiErrorBody) ?? {});
  }
  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
