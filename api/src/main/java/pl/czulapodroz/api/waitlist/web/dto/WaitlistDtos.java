package pl.czulapodroz.api.waitlist.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/** Kontrakty listy rezerwowej. */
public final class WaitlistDtos {

    private WaitlistDtos() {}

    public record JoinRequest(
            @NotBlank String tripSlug,
            @NotBlank @Size(max = 160) String name,
            @NotBlank @Email @Size(max = 320) String email,
            @Size(max = 40) String phone) {}

    /**
     * @param position miejsce w kolejce — klientka od razu wie, jak blisko jest
     */
    public record WaitlistEntryResponse(
            String id,
            String tripSlug,
            String tripTitle,
            String name,
            String email,
            String phone,
            String status,
            int position,
            Instant createdAt) {}
}
