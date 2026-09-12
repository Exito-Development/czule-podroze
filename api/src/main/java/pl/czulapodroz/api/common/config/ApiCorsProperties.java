package pl.czulapodroz.api.common.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Dozwolone źródła dla przeglądarki (frontend Next.js).
 *
 * @param allowedOrigins pełne adresy, np. `http://localhost:3002`
 */
@ConfigurationProperties(prefix = "czula.cors")
public record ApiCorsProperties(List<String> allowedOrigins) {

    public ApiCorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    }
}
