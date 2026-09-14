package pl.czulapodroz.api.payment.gateway;

import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import pl.czulapodroz.api.payment.PaymentGateway;
import pl.czulapodroz.api.payment.PaymentProperties;

/**
 * Atrapa operatora płatności na czas developmentu.
 *
 * Zachowuje się jak prawdziwy operator: zwraca adres zewnętrznej „strony
 * płatności" (hostowanej przez nas pod `/api/v1/payments/mock/...`), gdzie
 * można wpłatę potwierdzić albo odrzucić. Dzięki temu cała ścieżka
 * zamówienie → przekierowanie → powrót → potwierdzenie działa tak samo, jak
 * będzie działać z Przelewami24, i podmiana operatora nie zmienia frontendu.
 */
@Component
@ConditionalOnProperty(name = "czula.payments.provider", havingValue = "mock", matchIfMissing = true)
public class MockPaymentGateway implements PaymentGateway {

    private final PaymentProperties paymentProperties;

    public MockPaymentGateway(PaymentProperties paymentProperties) {
        this.paymentProperties = paymentProperties;
    }

    @Override
    public String providerName() {
        return "mock";
    }

    @Override
    public PaymentSession createSession(PaymentSessionRequest request) {
        String externalId = "mock_" + UUID.randomUUID();
        String redirectUrl =
                "%s/api/v1/payments/mock/%s?returnUrl=%s"
                        .formatted(
                                paymentProperties.apiBaseUrl(),
                                externalId,
                                java.net.URLEncoder.encode(
                                        request.returnUrl(), java.nio.charset.StandardCharsets.UTF_8));
        return new PaymentSession(externalId, redirectUrl);
    }
}
