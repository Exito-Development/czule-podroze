package pl.czulapodroz.api.payment.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.common.error.UnauthorizedException;
import pl.czulapodroz.api.payment.PaymentProperties;
import pl.czulapodroz.api.payment.PaymentService;
import pl.czulapodroz.api.payment.web.dto.PaymentDtos;

/** Start płatności i powiadomienia od operatora. */
@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Płatności", description = "Sesje płatności i powiadomienia operatora")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentProperties paymentProperties;

    public PaymentController(
            PaymentService paymentService, PaymentProperties paymentProperties) {
        this.paymentService = paymentService;
        this.paymentProperties = paymentProperties;
    }

    @PostMapping
    @Operation(
            summary = "Rozpoczyna płatność za zamówienie",
            description = "Zwraca adres operatora, pod który należy przekierować klientkę.")
    public PaymentDtos.PaymentSessionResponse start(
            @Valid @RequestBody PaymentDtos.StartPaymentRequest request) {
        return paymentService.startPayment(request);
    }

    @GetMapping("/{externalId}")
    @Operation(summary = "Stan płatności")
    public PaymentDtos.PaymentSessionResponse get(@PathVariable String externalId) {
        return paymentService.get(externalId);
    }

    /**
     * Powiadomienie od operatora (webhook).
     *
     * W środowisku produkcyjnym podpis trzeba weryfikować zgodnie ze
     * specyfikacją operatora (Przelewy24 liczy SHA-384 z wybranych pól).
     * Tutaj sprawdzamy wspólny sekret — wystarczy, by nikt z zewnątrz nie
     * mógł „potwierdzić" cudzej płatności.
     */
    @PostMapping("/webhook")
    @Operation(summary = "Powiadomienie operatora o wyniku płatności")
    public ResponseEntity<Void> webhook(
            @RequestHeader(name = "X-Payment-Signature", required = false) String signature,
            @Valid @RequestBody PaymentDtos.WebhookNotification notification) {

        verifySignature(signature);

        switch (notification.status().toUpperCase(java.util.Locale.ROOT)) {
            case "SUCCEEDED", "SUCCESS", "PAID" -> paymentService.confirm(notification.externalId());
            case "CANCELLED", "CANCELED" -> paymentService.cancel(notification.externalId());
            default -> paymentService.fail(notification.externalId(), notification.reason());
        }
        return ResponseEntity.noContent().build();
    }

    private void verifySignature(String signature) {
        String expected = paymentProperties.webhookSecret();
        if (expected == null || expected.isBlank()) {
            throw new UnauthorizedException(
                    "payment.webhookNotConfigured",
                    "Webhook płatności nie jest skonfigurowany (czula.payments.webhook-secret)");
        }
        if (signature == null
                || !java.security.MessageDigest.isEqual(
                        signature.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        expected.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            throw new UnauthorizedException(
                    "payment.badSignature", "Nieprawidłowy podpis powiadomienia");
        }
    }
}
