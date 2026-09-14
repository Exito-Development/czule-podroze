package pl.czulapodroz.api.catalog.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/** Podmiana całego planu dzień po dniu (panel administracyjny). */
public record ItineraryUpdateRequest(
        @NotEmpty @Valid List<TripUpsertRequest.DayRequest> days) {}
