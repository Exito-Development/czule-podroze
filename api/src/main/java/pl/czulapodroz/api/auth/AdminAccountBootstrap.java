package pl.czulapodroz.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import pl.czulapodroz.api.auth.domain.UserAccount;
import pl.czulapodroz.api.auth.domain.UserRole;

/**
 * Zakłada konto organizatorki przy starcie, jeśli jeszcze go nie ma.
 *
 * Bez tego świeże środowisko nie miałoby jak wejść do panelu. Konto powstaje
 * tylko wtedy, gdy `czula.admin.*` jest ustawione — w produkcji ustawia się to
 * raz, ze zmiennych środowiskowych, i hasło zmienia po pierwszym logowaniu.
 */
@Configuration
public class AdminAccountBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountBootstrap.class);

    @Bean
    public ApplicationRunner createAdminAccount(
            AdminBootstrapProperties properties,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (!properties.isConfigured()) {
                return;
            }
            String email = UserAccount.normalizeEmail(properties.bootstrapEmail());
            if (userAccountRepository.existsByEmail(email)) {
                return;
            }
            userAccountRepository.save(
                    new UserAccount(
                            email,
                            passwordEncoder.encode(properties.bootstrapPassword()),
                            "Organizatorka",
                            null,
                            UserRole.ADMIN));
            log.warn(
                    "Utworzono konto administracyjne {} z hasłem startowym z konfiguracji — "
                            + "zmień je po pierwszym logowaniu",
                    email);
        };
    }
}
