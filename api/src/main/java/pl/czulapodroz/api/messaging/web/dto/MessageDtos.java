package pl.czulapodroz.api.messaging.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

/** Kontrakty wiadomości do uczestniczek. */
public final class MessageDtos {

    private MessageDtos() {}

    /**
     * @param audience  grupa odbiorczyń: PARTICIPANTS / BALANCE_DUE / PENDING_PAYMENT / WAITLIST
     * @param body      treść; obsługuje podstawienia {@code {{imie}}}, {@code {{wyjazd}}},
     *                  {@code {{numer_rezerwacji}}}, {@code {{do_doplaty}}}
     */
    public record SendMessageRequest(
            @NotBlank String audience,
            @NotBlank @Size(max = 200) String subject,
            @NotBlank @Size(max = 10000) String body) {}

    /** Kto dostanie wiadomość — podgląd przed wysyłką. */
    public record RecipientPreviewResponse(
            String audience, String audienceLabel, int count, List<RecipientResponse> recipients) {}

    public record RecipientResponse(String name, String email) {}

    public record MessageResponse(
            String id,
            String tripSlug,
            String tripTitle,
            String subject,
            String body,
            String audience,
            String audienceLabel,
            String sentBy,
            Instant sentAt,
            int recipientCount,
            int failedCount,
            String provider,
            List<DeliveryResponse> deliveries) {}

    public record DeliveryResponse(
            String recipientName, String recipientEmail, String status, String failureReason) {}

    /** Dostępne grupy odbiorczyń wraz z aktualną liczebnością. */
    public record AudienceOptionResponse(String value, String label, int count) {}
}
