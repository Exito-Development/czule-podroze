package pl.czulapodroz.api.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Generowanie i porównywanie sekretów (tokeny odświeżające, tokeny dostępu
 * do rezerwacji).
 *
 * W bazie trzymamy wyłącznie skrót SHA-256 — wyciek tabeli nie daje więc
 * możliwości użycia tokenu. Porównanie jest stałoczasowe, żeby nie dało się
 * zgadywać tokenu po czasie odpowiedzi.
 */
public final class SecureTokens {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private SecureTokens() {}

    /** Losowy, bezpieczny token w postaci url-safe base64. */
    public static String generate(int bytes) {
        byte[] buffer = new byte[bytes];
        RANDOM.nextBytes(buffer);
        return URL_ENCODER.encodeToString(buffer);
    }

    /** Krótki, czytelny kod (np. numer zamówienia) — bez znaków mylących. */
    public static String generateCode(int length) {
        final String alphabet = "ACDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            builder.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
        }
        return builder.toString();
    }

    /** Skrót SHA-256 w zapisie heksadecymalnym. */
    public static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Brak algorytmu SHA-256", exception);
        }
    }

    /** Porównanie odporne na atak czasowy. */
    public static boolean matches(String rawValue, String expectedHash) {
        if (rawValue == null || expectedHash == null) {
            return false;
        }
        return MessageDigest.isEqual(
                hash(rawValue).getBytes(StandardCharsets.UTF_8),
                expectedHash.getBytes(StandardCharsets.UTF_8));
    }
}
