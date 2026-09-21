import { apiRequest } from "@/lib/api/client";

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  /** Pole-pułapka: wypełnione oznacza robota. Człowiek go nie widzi. */
  botField?: string;
}

export function sendContactMessage(input: ContactInput): Promise<{ id: string | null }> {
  return apiRequest<{ id: string | null }>("/api/v1/contact", {
    method: "POST",
    body: input,
  });
}
