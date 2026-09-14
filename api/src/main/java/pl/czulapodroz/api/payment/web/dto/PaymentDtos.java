package pl.czulapodroz.api.payment.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

/** Kontrakty płatności. */
public final class PaymentDtos {

    private PaymentDtos() {}

    /**
     * @param orderNumber numer zamówienia
     * @param accessToken token z odpowiedzi po złożeniu zamówienia
     */
    public record StartPaymentRequest(@NotBlank String orderNumber, @NotBlank String accessToken) {}

    /**
     * @param redirectUrl adres strony operatora — tam przekierowujemy klientkę
     */
    public record PaymentSessionResponse(
            String paymentId,
            String provider,
            String status,
            BigDecimal amount,
            String currency,
            String redirectUrl) {}

    public record WebhookNotification(
            @NotBlank String externalId, @NotBlank String status, String reason) {}
}
