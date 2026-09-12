package pl.czulapodroz.api.auth.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Konfiguracja tokenów.
 *
 * @param secret          klucz HMAC (min. 32 znaki) — w produkcji z ENV, nigdy z repozytorium
 * @param issuer          wystawca umieszczany w tokenie
 * @param accessTokenTtl  czas życia tokenu dostępowego (krótki — to on krąży po sieci)
 * @param refreshTokenTtl czas życia tokenu odświeżającego
 */
@ConfigurationProperties(prefix = "czula.security.jwt")
public record JwtProperties(
        String secret, String issuer, Duration accessTokenTtl, Duration refreshTokenTtl) {

    public JwtProperties {
        issuer = issuer == null ? "czula-podroz-api" : issuer;
        accessTokenTtl = accessTokenTtl == null ? Duration.ofMinutes(15) : accessTokenTtl;
        refreshTokenTtl = refreshTokenTtl == null ? Duration.ofDays(14) : refreshTokenTtl;
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "czula.security.jwt.secret musi mieć co najmniej 32 znaki "
                            + "(HS256 wymaga klucza 256-bitowego)");
        }
    }
}
