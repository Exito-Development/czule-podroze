package pl.czulapodroz.api.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import pl.czulapodroz.api.common.config.RequiredConfig;

/**
 * Konfiguracja płatności.
 *
 * @param provider       aktywny operator (`mock` w środowisku lokalnym)
 * @param apiBaseUrl     publiczny adres API — potrzebny, by operator mógł wrócić
 * @param webhookSecret  sekret do weryfikacji powiadomień od operatora
 */
@ConfigurationProperties(prefix = "czula.payments")
public record PaymentProperties(String provider, String apiBaseUrl, String webhookSecret) {

    public PaymentProperties {
        provider = provider == null ? "mock" : provider;
        apiBaseUrl =
                apiBaseUrl == null
                        ? "http://localhost:8080"
                        : stripTrailingSlash(
                                RequiredConfig.resolved(apiBaseUrl, "czula.payments.api-base-url"));
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
