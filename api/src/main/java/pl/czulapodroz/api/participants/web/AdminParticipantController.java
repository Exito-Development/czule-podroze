package pl.czulapodroz.api.participants.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.participants.ParticipantService;
import pl.czulapodroz.api.participants.web.dto.ParticipantDtos;

/** Lista uczestniczek wyjazdu — panel organizatorek. */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administracja")
public class AdminParticipantController {

    private final ParticipantService participantService;

    public AdminParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping("/trips/{slug}/participants")
    @Operation(summary = "Lista uczestniczek wyjazdu wraz z podsumowaniem miejsc")
    public ParticipantDtos.RosterResponse roster(@PathVariable String slug) {
        return participantService.roster(slug);
    }

    @GetMapping("/trips/{slug}/participants/csv")
    @Operation(summary = "Lista uczestniczek do arkusza (CSV)")
    public ResponseEntity<byte[]> csv(@PathVariable String slug) {
        byte[] body = participantService.csv(slug).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"uczestnicy-%s.csv\"".formatted(slug))
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(body);
    }

    @PutMapping("/participants/{participantId}")
    @Operation(summary = "Uzupełnia lub poprawia dane uczestniczki")
    public ParticipantDtos.ParticipantResponse update(
            @PathVariable UUID participantId,
            @Valid @RequestBody ParticipantDtos.UpdateParticipantRequest request) {
        return participantService.update(participantId, request);
    }

    @PostMapping("/participants/{participantId}/cancel")
    @Operation(summary = "Oznacza rezygnację uczestniczki")
    public ParticipantDtos.ParticipantResponse cancel(@PathVariable UUID participantId) {
        return participantService.cancel(participantId);
    }

    @PostMapping("/participants/{participantId}/restore")
    @Operation(summary = "Cofa rezygnację")
    public ParticipantDtos.ParticipantResponse restore(@PathVariable UUID participantId) {
        return participantService.restore(participantId);
    }
}
