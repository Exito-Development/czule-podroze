package pl.czulapodroz.api.catalog.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.catalog.TripCatalogService;
import pl.czulapodroz.api.catalog.domain.Continent;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.common.error.BadRequestException;

/** Publiczny katalog wyjazdów — to, co widzi strona. */
@RestController
@RequestMapping("/api/v1/trips")
@Tag(name = "Katalog", description = "Wyjazdy, plany dzień po dniu i dostępność miejsc")
public class TripController {

    private final TripCatalogService tripCatalogService;

    public TripController(TripCatalogService tripCatalogService) {
        this.tripCatalogService = tripCatalogService;
    }

    @GetMapping
    @Operation(summary = "Lista opublikowanych wyjazdów, opcjonalnie po kontynencie")
    public List<TripResponse> list(@RequestParam(required = false) String continent) {
        return tripCatalogService.listPublished(parseContinent(continent));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Szczegóły wyjazdu wraz z planem dzień po dniu")
    public TripResponse get(@PathVariable String slug) {
        return tripCatalogService.getBySlug(slug);
    }

    @GetMapping("/{slug}/availability")
    @Operation(summary = "Aktualna dostępność miejsc (z uwzględnieniem koszyków)")
    public TripResponse.AvailabilityResponse availability(@PathVariable String slug) {
        return tripCatalogService.availability(slug);
    }

    private Continent parseContinent(String value) {
        if (value == null || value.isBlank() || "Wszystkie".equalsIgnoreCase(value)) {
            return null;
        }
        try {
            return Continent.fromApiValue(value);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "continent.unknown",
                    "Nieznany kontynent: %s. Dostępne: %s"
                            .formatted(
                                    value,
                                    Arrays.stream(Continent.values())
                                            .map(Continent::polishName)
                                            .toList()));
        }
    }
}
