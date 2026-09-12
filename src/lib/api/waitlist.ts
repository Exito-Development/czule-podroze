import { apiRequest } from "@/lib/api/client";
import type { WaitlistEntryDto } from "@/lib/api/types";

export function joinWaitlist(input: {
  tripSlug: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<WaitlistEntryDto> {
  return apiRequest<WaitlistEntryDto>("/api/v1/waitlist", {
    method: "POST",
    body: input,
  });
}
