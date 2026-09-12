package pl.czulapodroz.api.auth.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.auth.AuthService;
import pl.czulapodroz.api.auth.CurrentUserProvider;
import pl.czulapodroz.api.auth.web.dto.AuthDtos;

/** Rejestracja, logowanie, odświeżanie i wylogowanie. */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Konto", description = "Logowanie klientek i organizatorek")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserProvider currentUserProvider;

    public AuthController(AuthService authService, CurrentUserProvider currentUserProvider) {
        this.authService = authService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/register")
    @Operation(summary = "Zakłada konto klientki i od razu loguje")
    public AuthDtos.TokenResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Loguje i zwraca parę tokenów")
    public AuthDtos.TokenResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Wymienia token odświeżający na nową parę (rotacja)")
    public AuthDtos.TokenResponse refresh(@Valid @RequestBody AuthDtos.RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    @Operation(summary = "Unieważnia sesję powiązaną z tokenem odświeżającym")
    public ResponseEntity<Void> logout(@Valid @RequestBody AuthDtos.RefreshRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Dane zalogowanej użytkowniczki")
    public AuthDtos.UserResponse me() {
        return AuthService.toUserResponse(currentUserProvider.requireCurrentUser());
    }
}
