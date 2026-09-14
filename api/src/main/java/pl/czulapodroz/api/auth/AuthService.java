package pl.czulapodroz.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.auth.domain.UserAccount;
import pl.czulapodroz.api.auth.domain.UserRole;
import pl.czulapodroz.api.auth.security.AccessTokenService;
import pl.czulapodroz.api.auth.web.dto.AuthDtos;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.common.error.UnauthorizedException;

/** Rejestracja, logowanie i odnawianie sesji. */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccessTokenService accessTokenService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            AccessTokenService accessTokenService,
            RefreshTokenService refreshTokenService) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.accessTokenService = accessTokenService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthDtos.TokenResponse register(AuthDtos.RegisterRequest request) {
        String email = UserAccount.normalizeEmail(request.email());
        if (userAccountRepository.existsByEmail(email)) {
            throw new ConflictException(
                    "auth.emailTaken", "Konto z tym adresem e-mail już istnieje");
        }

        UserAccount user =
                userAccountRepository.save(
                        new UserAccount(
                                email,
                                passwordEncoder.encode(request.password()),
                                request.firstName(),
                                request.lastName(),
                                UserRole.CUSTOMER));
        log.info("Zarejestrowano konto {}", user.getId());
        return issueTokens(user);
    }

    @Transactional
    public AuthDtos.TokenResponse login(AuthDtos.LoginRequest request) {
        String email = UserAccount.normalizeEmail(request.email());
        UserAccount user =
                userAccountRepository
                        .findByEmail(email)
                        .filter(candidate -> passwordEncoder.matches(
                                request.password(), candidate.getPasswordHash()))
                        .filter(UserAccount::isEnabled)
                        // Ten sam komunikat dla złego hasła i nieznanego konta —
                        // inaczej można by sprawdzać, kto ma u nas konto.
                        .orElseThrow(
                                () ->
                                        new UnauthorizedException(
                                                "auth.badCredentials",
                                                "Nieprawidłowy e-mail lub hasło"));
        return issueTokens(user);
    }

    // Patrz RefreshTokenService.rotate — unieważnienie rodziny tokenów po
    // wykryciu kradzieży musi przetrwać wyjątek, który po nim leci.
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public AuthDtos.TokenResponse refresh(String refreshToken) {
        RefreshTokenService.RotationResult rotation = refreshTokenService.rotate(refreshToken);
        UserAccount user = rotation.user();
        if (!user.isEnabled()) {
            throw new UnauthorizedException("auth.accountDisabled", "Konto jest nieaktywne");
        }
        AccessTokenService.IssuedAccessToken accessToken = accessTokenService.issue(user);
        return new AuthDtos.TokenResponse(
                accessToken.value(),
                rotation.refreshToken().value(),
                accessToken.expiresInSeconds(),
                rotation.refreshToken().expiresAt(),
                toUserResponse(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    private AuthDtos.TokenResponse issueTokens(UserAccount user) {
        AccessTokenService.IssuedAccessToken accessToken = accessTokenService.issue(user);
        RefreshTokenService.IssuedRefreshToken refreshToken =
                refreshTokenService.issueNewFamily(user);
        return new AuthDtos.TokenResponse(
                accessToken.value(),
                refreshToken.value(),
                accessToken.expiresInSeconds(),
                refreshToken.expiresAt(),
                toUserResponse(user));
    }

    public static AuthDtos.UserResponse toUserResponse(UserAccount user) {
        return new AuthDtos.UserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());
    }
}
