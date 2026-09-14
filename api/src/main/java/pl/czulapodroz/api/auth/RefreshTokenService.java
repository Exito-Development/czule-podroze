package pl.czulapodroz.api.auth;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.auth.domain.RefreshToken;
import pl.czulapodroz.api.auth.domain.UserAccount;
import pl.czulapodroz.api.auth.security.JwtProperties;
import pl.czulapodroz.api.common.error.UnauthorizedException;
import pl.czulapodroz.api.common.util.SecureTokens;

/**
 * Wydawanie i rotacja tokenów odświeżających.
 *
 * Każde użycie tokenu kończy jego życie i wydaje nowy. Ponowne użycie tokenu
 * już zrotowanego oznacza, że ktoś go przechwycił — wtedy unieważniamy całą
 * rodzinę tokenów z tego logowania.
 */
@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final int TOKEN_BYTES = 48;

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final Clock clock;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            JwtProperties jwtProperties,
            Clock clock) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
        this.clock = clock;
    }

    /** Nowa rodzina tokenów — wołane przy logowaniu i rejestracji. */
    @Transactional
    public IssuedRefreshToken issueNewFamily(UserAccount user) {
        return issue(user, UUID.randomUUID());
    }

    /**
     * Wymienia token na nowy w ramach tej samej rodziny.
     *
     * `noRollbackFor` jest tu istotne: przy wykryciu ponownego użycia tokenu
     * unieważniamy całą rodzinę i dopiero potem rzucamy wyjątek. Bez tego
     * wycofanie transakcji cofnęłoby też unieważnienie i skradziona sesja
     * działałaby dalej.
     *
     * @throws UnauthorizedException gdy token jest nieznany, wygasł lub został już użyty
     */
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public RotationResult rotate(String rawToken) {
        Instant now = clock.instant();
        RefreshToken stored =
                refreshTokenRepository
                        .findByTokenHash(SecureTokens.hash(rawToken))
                        .orElseThrow(
                                () ->
                                        new UnauthorizedException(
                                                "auth.refreshInvalid",
                                                "Sesja wygasła — zaloguj się ponownie"));

        if (stored.getRevokedAt() != null) {
            // Token był już wymieniony — ktoś używa kopii. Ucinamy całą rodzinę.
            log.warn(
                    "Ponowne użycie zrotowanego tokenu odświeżającego (rodzina {}) — "
                            + "unieważniam sesję",
                    stored.getFamilyId());
            refreshTokenRepository.revokeFamily(stored.getFamilyId(), now);
            throw new UnauthorizedException(
                    "auth.refreshReused", "Wykryto ponowne użycie tokenu — zaloguj się ponownie");
        }

        if (!stored.isUsableAt(now)) {
            throw new UnauthorizedException(
                    "auth.refreshExpired", "Sesja wygasła — zaloguj się ponownie");
        }

        stored.revoke(now);
        refreshTokenRepository.save(stored);

        IssuedRefreshToken issued = issue(stored.getUser(), stored.getFamilyId());
        return new RotationResult(stored.getUser(), issued);
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository
                .findByTokenHash(SecureTokens.hash(rawToken))
                .ifPresent(
                        token -> {
                            refreshTokenRepository.revokeFamily(
                                    token.getFamilyId(), clock.instant());
                        });
    }

    @Transactional
    public int deleteExpired() {
        return refreshTokenRepository.deleteExpired(clock.instant());
    }

    private IssuedRefreshToken issue(UserAccount user, UUID familyId) {
        String rawToken = SecureTokens.generate(TOKEN_BYTES);
        Instant expiresAt = clock.instant().plus(jwtProperties.refreshTokenTtl());
        refreshTokenRepository.save(
                new RefreshToken(user, SecureTokens.hash(rawToken), familyId, expiresAt));
        return new IssuedRefreshToken(rawToken, expiresAt);
    }

    public record IssuedRefreshToken(String value, Instant expiresAt) {}

    public record RotationResult(UserAccount user, IssuedRefreshToken refreshToken) {}
}
