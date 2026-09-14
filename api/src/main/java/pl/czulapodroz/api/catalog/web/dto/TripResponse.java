package pl.czulapodroz.api.catalog.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Wyjazd w postaci oczekiwanej przez frontend.
 *
 * Kształt odpowiada typowi `Trip` z `src/lib/data/trips.ts`, żeby podmiana
 * statycznych danych na `fetch` nie wymagała zmian w komponentach. `booked`
 * uwzględnia też miejsca trzymane w cudzych koszykach, więc licznik
 * „ile zostało" jest zawsze zgodny z tym, co faktycznie można kupić.
 */
public record TripResponse(
        String slug,
        String title,
        String tagline,
        String continent,
        String country,
        int durationDays,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal price,
        BigDecimal deposit,
        int capacity,
        int booked,
        String status,
        String coverImage,
        List<DestinationResponse> destinations,
        List<String> included,
        List<DayResponse> itinerary,
        AvailabilityResponse availability) {

    public record DestinationResponse(
            String name, String dayRange, String description, String image) {}

    public record DayResponse(int day, String title, String description, List<String> tags) {}

    /**
     * @param capacity  pojemność
     * @param booked    miejsca opłacone
     * @param held      miejsca trzymane teraz w koszykach
     * @param available miejsca możliwe do kupienia w tej chwili
     */
    public record AvailabilityResponse(int capacity, int booked, int held, int available) {}
}
