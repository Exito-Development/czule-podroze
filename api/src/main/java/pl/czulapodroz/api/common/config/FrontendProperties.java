package pl.czulapodroz.api.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Adres frontendu — potrzebny do budowania linków powrotnych z płatności
 * i linków do podglądu rezerwacji wysyłanych w mailu.
 *
 * @param baseUrl np. `http://localhost:3002`
 */
@ConfigurationProperties(prefix = "czula.frontend")
public record FrontendProperties(String baseUrl) {

    public FrontendProperties {
        baseUrl =
                baseUrl == null
                        ? "http://localhost:3002"
                        : stripTrailingSlash(
                                RequiredConfig.resolved(baseUrl, "czula.frontend.base-url"));
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    public String reservationUrl(String orderNumber, String accessToken) {
        return "%s/rezerwacja/%s?token=%s".formatted(baseUrl, orderNumber, accessToken);
    }
}
