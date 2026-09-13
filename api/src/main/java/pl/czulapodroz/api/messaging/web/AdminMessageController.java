package pl.czulapodroz.api.messaging.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.auth.CurrentUserProvider;
import pl.czulapodroz.api.messaging.MessagingService;
import pl.czulapodroz.api.messaging.web.dto.MessageDtos;

/** Wiadomości i powiadomienia do uczestniczek — panel organizatorek. */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administracja")
public class AdminMessageController {

    private final MessagingService messagingService;
    private final CurrentUserProvider currentUserProvider;

    public AdminMessageController(
            MessagingService messagingService, CurrentUserProvider currentUserProvider) {
        this.messagingService = messagingService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/trips/{slug}/messages/audiences")
    @Operation(summary = "Grupy odbiorczyń wraz z aktualną liczebnością")
    public List<MessageDtos.AudienceOptionResponse> audiences(@PathVariable String slug) {
        return messagingService.audiences(slug);
    }

    @GetMapping("/trips/{slug}/messages/preview")
    @Operation(summary = "Kto dokładnie dostanie wiadomość — podgląd przed wysyłką")
    public MessageDtos.RecipientPreviewResponse preview(
            @PathVariable String slug, @RequestParam String audience) {
        return messagingService.preview(slug, audience);
    }

    @PostMapping("/trips/{slug}/messages")
    @Operation(summary = "Wysyła wiadomość do wybranej grupy")
    public MessageDtos.MessageResponse send(
            @PathVariable String slug,
            @Valid @RequestBody MessageDtos.SendMessageRequest request) {
        return messagingService.send(
                slug, request, currentUserProvider.requireCurrentUser().getEmail());
    }

    @GetMapping("/trips/{slug}/messages")
    @Operation(summary = "Historia wysyłek dla wyjazdu")
    public List<MessageDtos.MessageResponse> history(@PathVariable String slug) {
        return messagingService.history(slug);
    }

    @GetMapping("/messages")
    @Operation(summary = "Historia wszystkich wysyłek")
    public List<MessageDtos.MessageResponse> allHistory() {
        return messagingService.allHistory();
    }

    @GetMapping("/messages/{messageId}")
    @Operation(summary = "Szczegóły wiadomości wraz z wynikiem każdego doręczenia")
    public MessageDtos.MessageResponse detail(@PathVariable UUID messageId) {
        return messagingService.detail(messageId);
    }
}
