package pl.czulapodroz.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.auth.web.dto.AuthDtos;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.common.error.UnauthorizedException;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.MutableClock;

@IntegrationTest
@Transactional
@DisplayName("Logowanie i rotacja tokenów")
class AuthServiceIntegrationTest {

    @Autowired private AuthService authService;
    @Autowired private RefreshTokenService refreshTokenService;
    @Autowired private MutableClock clock;

    private AuthDtos.TokenResponse register(String email) {
        return authService.register(
                new AuthDtos.RegisterRequest(email, "bardzo-dlugie-haslo", "Anna", "Kowalska"));
    }

    @Test
    @DisplayName("rejestracja od razu loguje i normalizuje e-mail")
    void registrationLogsInAndNormalizesEmail() {
        AuthDtos.TokenResponse tokens = register("Anna.Kowalska@Example.TEST");

        assertThat(tokens.accessToken()).isNotBlank();
        assertThat(tokens.refreshToken()).isNotBlank();
        assertThat(tokens.user().email()).isEqualTo("anna.kowalska@example.test");
        assertThat(tokens.user().role()).isEqualTo("CUSTOMER");
    }

    @Test
    @DisplayName("nie pozwala założyć drugiego konta na ten sam e-mail")
    void rejectsDuplicateEmail() {
        register("duplikat@example.test");

        assertThatThrownBy(() -> register("Duplikat@example.test"))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("błędne hasło i nieznane konto dają ten sam komunikat")
    void loginFailuresAreIndistinguishable() {
        register("logowanie@example.test");

        assertThatThrownBy(
                        () ->
                                authService.login(
                                        new AuthDtos.LoginRequest(
                                                "logowanie@example.test", "zle-haslo")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Nieprawidłowy e-mail lub hasło");

        assertThatThrownBy(
                        () ->
                                authService.login(
                                        new AuthDtos.LoginRequest(
                                                "nieznane@example.test", "bardzo-dlugie-haslo")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Nieprawidłowy e-mail lub hasło");
    }

    @Test
    @DisplayName("odświeżenie wydaje nowy token i unieważnia poprzedni")
    void refreshRotatesToken() {
        AuthDtos.TokenResponse first = register("rotacja@example.test");

        AuthDtos.TokenResponse second = authService.refresh(first.refreshToken());

        assertThat(second.refreshToken()).isNotEqualTo(first.refreshToken());
        assertThatThrownBy(() -> authService.refresh(first.refreshToken()))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("ponowne użycie zrotowanego tokenu unieważnia całą sesję")
    void tokenReuseKillsWholeFamily() {
        AuthDtos.TokenResponse first = register("kradziez@example.test");
        AuthDtos.TokenResponse second = authService.refresh(first.refreshToken());

        // Ktoś próbuje użyć wykradzionej, starej kopii tokenu.
        assertThatThrownBy(() -> authService.refresh(first.refreshToken()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("ponowne użycie");

        // …przez co token prawowitej właścicielki też przestaje działać.
        assertThatThrownBy(() -> authService.refresh(second.refreshToken()))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("wylogowanie unieważnia token odświeżający")
    void logoutRevokesToken() {
        AuthDtos.TokenResponse tokens = register("wylogowanie@example.test");

        authService.logout(tokens.refreshToken());

        assertThatThrownBy(() -> authService.refresh(tokens.refreshToken()))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("token odświeżający wygasa po swoim czasie życia")
    void refreshTokenExpires() {
        AuthDtos.TokenResponse tokens = register("wygasanie@example.test");

        clock.advance(Duration.ofDays(15));

        assertThatThrownBy(() -> authService.refresh(tokens.refreshToken()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Sesja wygasła");
    }

    @Test
    @DisplayName("sprzątanie usuwa wygasłe tokeny z bazy")
    void deletesExpiredTokens() {
        register("sprzatanie@example.test");
        clock.advance(Duration.ofDays(15));

        assertThat(refreshTokenService.deleteExpired()).isPositive();
    }
}
