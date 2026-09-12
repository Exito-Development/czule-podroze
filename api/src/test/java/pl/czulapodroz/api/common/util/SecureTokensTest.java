package pl.czulapodroz.api.common.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Tokeny")
class SecureTokensTest {

    @Test
    @DisplayName("dwa wygenerowane tokeny nigdy nie są takie same")
    void generatesUniqueTokens() {
        assertThat(SecureTokens.generate(32)).isNotEqualTo(SecureTokens.generate(32));
    }

    @Test
    @DisplayName("skrót jest powtarzalny i różny od samego tokenu")
    void hashesDeterministically() {
        String token = SecureTokens.generate(32);

        assertThat(SecureTokens.hash(token)).isEqualTo(SecureTokens.hash(token));
        assertThat(SecureTokens.hash(token)).isNotEqualTo(token).hasSize(64);
    }

    @Test
    @DisplayName("porównuje token ze skrótem i odrzuca podmieniony")
    void matchesOnlyTheOriginalToken() {
        String token = SecureTokens.generate(32);
        String hash = SecureTokens.hash(token);

        assertThat(SecureTokens.matches(token, hash)).isTrue();
        assertThat(SecureTokens.matches("podmieniony", hash)).isFalse();
        assertThat(SecureTokens.matches(null, hash)).isFalse();
    }

    @Test
    @DisplayName("kod zamówienia pomija znaki mylące przy przepisywaniu")
    void generatesReadableCodes() {
        String code = SecureTokens.generateCode(8);

        assertThat(code).hasSize(8).doesNotContain("O", "I", "B", "0", "1");
    }
}
