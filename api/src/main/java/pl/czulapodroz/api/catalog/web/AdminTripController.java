package pl.czulapodroz.api.catalog.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.catalog.TripAdminService;
import pl.czulapodroz.api.catalog.web.dto.ItineraryUpdateRequest;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.catalog.web.dto.TripUpsertRequest;

/** Panel administracyjny — definiowanie wyjazdów i planu dzień po dniu. */
@RestController
@RequestMapping("/api/v1/admin/trips")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administracja", description = "Zarządzanie ofertą (wymaga roli ADMIN)")
public class AdminTripController {

    private final TripAdminService tripAdminService;

    public AdminTripController(TripAdminService tripAdminService) {
        this.tripAdminService = tripAdminService;
    }

    @GetMapping
    @Operation(summary = "Wszystkie wyjazdy, także nieopublikowane")
    public List<TripResponse> list() {
        return tripAdminService.listAll();
    }

    @PostMapping
    @Operation(summary = "Dodaje nowy wyjazd wraz z planem")
    public ResponseEntity<TripResponse> create(@Valid @RequestBody TripUpsertRequest request) {
        TripResponse created = tripAdminService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/trips/" + created.slug())).body(created);
    }

    @PutMapping("/{slug}")
    @Operation(summary = "Aktualizuje dane wyjazdu")
    public TripResponse update(
            @PathVariable String slug, @Valid @RequestBody TripUpsertRequest request) {
        return tripAdminService.update(slug, request);
    }

    @PutMapping("/{slug}/itinerary")
    @Operation(summary = "Podmienia plan dzień po dniu")
    public TripResponse replaceItinerary(
            @PathVariable String slug, @Valid @RequestBody ItineraryUpdateRequest request) {
        return tripAdminService.replaceItinerary(slug, request);
    }

    @DeleteMapping("/{slug}")
    @Operation(summary = "Usuwa wyjazd (tylko gdy nie ma rezerwacji)")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        tripAdminService.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
