package pl.czulapodroz.api.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Konto organizatorki zakładane przy pierwszym starcie.
 *
 * Puste wartości (domyślnie w produkcji) wyłączają mechanizm — konto admina
 * zakłada się wtedy świadomie, a nie „samo".
 *
 * @param bootstrapEmail    adres konta administracyjnego
 * @param bootstrapPassword hasło startowe — do zmiany po pierwszym logowaniu
 */
@ConfigurationProperties(prefix = "czula.admin")
public record AdminBootstrapProperties(String bootstrapEmail, String bootstrapPassword) {

    public boolean isConfigured() {
        return bootstrapEmail != null
                && !bootstrapEmail.isBlank()
                && bootstrapPassword != null
                && !bootstrapPassword.isBlank();
    }
}
