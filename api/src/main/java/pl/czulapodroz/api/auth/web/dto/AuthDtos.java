package pl.czulapodroz.api.auth.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/** Kontrakty logowania i rejestracji. */
public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 320) String email,
            @NotBlank @Size(min = 10, max = 100, message = "Hasło musi mieć co najmniej 10 znaków")
                    String password,
            @Size(max = 120) String firstName,
            @Size(max = 120) String lastName) {}

    public record LoginRequest(
            @NotBlank @Email String email, @NotBlank String password) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    /**
     * @param accessToken       token do nagłówka `Authorization: Bearer …`
     * @param refreshToken      token do odnowienia sesji (rotowany przy każdym użyciu)
     * @param expiresInSeconds  ile sekund żyje token dostępowy
     */
    public record TokenResponse(
            String accessToken,
            String refreshToken,
            long expiresInSeconds,
            Instant refreshTokenExpiresAt,
            UserResponse user) {}

    public record UserResponse(
            String id, String email, String firstName, String lastName, String role) {}
}
