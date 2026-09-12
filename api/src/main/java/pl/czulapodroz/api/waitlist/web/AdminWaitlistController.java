package pl.czulapodroz.api.waitlist.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.waitlist.WaitlistService;
import pl.czulapodroz.api.waitlist.web.dto.WaitlistDtos;

/** Podgląd listy rezerwowej dla organizatorek. */
@RestController
@RequestMapping("/api/v1/admin/waitlist")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administracja")
public class AdminWaitlistController {

    private final WaitlistService waitlistService;

    public AdminWaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    @Operation(summary = "Zgłoszenia na listę rezerwową, opcjonalnie dla jednego wyjazdu")
    public List<WaitlistDtos.WaitlistEntryResponse> list(
            @RequestParam(required = false) String tripSlug) {
        return tripSlug == null || tripSlug.isBlank()
                ? waitlistService.listAll()
                : waitlistService.listForTrip(tripSlug);
    }
}
