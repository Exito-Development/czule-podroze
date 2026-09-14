package pl.czulapodroz.api.auth.security;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;
import pl.czulapodroz.api.auth.domain.UserAccount;

/** Wystawia krótkożyciowe tokeny dostępowe (JWT, HS256). */
@Service
public class AccessTokenService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;
    private final Clock clock;

    public AccessTokenService(JwtEncoder jwtEncoder, JwtProperties jwtProperties, Clock clock) {
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
        this.clock = clock;
    }

    public IssuedAccessToken issue(UserAccount user) {
        Instant now = clock.instant();
        Instant expiresAt = now.plus(jwtProperties.accessTokenTtl());

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .issuer(jwtProperties.issuer())
                        .issuedAt(now)
                        .expiresAt(expiresAt)
                        .subject(user.getId().toString())
                        .claim("email", user.getEmail())
                        .claim("roles", List.of(user.getRole().name()))
                        .build();

        String token =
                jwtEncoder
                        .encode(
                                JwtEncoderParameters.from(
                                        JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                        .getTokenValue();
        return new IssuedAccessToken(token, expiresAt, jwtProperties.accessTokenTtl().toSeconds());
    }

    public record IssuedAccessToken(String value, Instant expiresAt, long expiresInSeconds) {}
}
