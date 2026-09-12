package pl.czulapodroz.api.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import pl.czulapodroz.api.common.domain.BaseEntity;

/**
 * Token odświeżający — przechowywany wyłącznie jako skrót SHA-256.
 *
 * Tokeny z jednego logowania tworzą „rodzinę" (`familyId`). Każde odświeżenie
 * unieważnia stary token i wydaje nowy (rotacja). Jeżeli ktoś użyje tokenu,
 * który został już zrotowany, traktujemy to jako kradzież i unieważniamy całą
 * rodzinę — sesja na wszystkich urządzeniach z tego logowania przestaje działać.
 */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "family_id", nullable = false)
    private UUID familyId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected RefreshToken() {
        // wymagane przez JPA
    }

    public RefreshToken(UserAccount user, String tokenHash, UUID familyId, Instant expiresAt) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.familyId = familyId;
        this.expiresAt = expiresAt;
    }

    public boolean isUsableAt(Instant moment) {
        return revokedAt == null && expiresAt.isAfter(moment);
    }

    public void revoke(Instant moment) {
        if (revokedAt == null) {
            this.revokedAt = moment;
        }
    }

    public UserAccount getUser() {
        return user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public UUID getFamilyId() {
        return familyId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }
}
