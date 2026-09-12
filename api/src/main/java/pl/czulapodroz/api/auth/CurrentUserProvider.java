package pl.czulapodroz.api.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.auth.domain.UserAccount;
import pl.czulapodroz.api.common.error.UnauthorizedException;

/** Dostęp do konta użytkowniczki stojącej za bieżącym żądaniem. */
@Component
public class CurrentUserProvider {

    private final UserAccountRepository userAccountRepository;

    public CurrentUserProvider(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public Optional<UUID> currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(jwt.getSubject()));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public Optional<UserAccount> currentUser() {
        return currentUserId().flatMap(userAccountRepository::findById);
    }

    @Transactional(readOnly = true)
    public UserAccount requireCurrentUser() {
        return currentUser()
                .orElseThrow(
                        () ->
                                new UnauthorizedException(
                                        "auth.required", "Zaloguj się, aby kontynuować"));
    }
}
