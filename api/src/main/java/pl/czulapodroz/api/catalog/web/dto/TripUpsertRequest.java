package pl.czulapodroz.api.catalog.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Dane wyjazdu wprowadzane w panelu administracyjnym. */
public record TripUpsertRequest(
        @NotBlank @Size(max = 120) String slug,
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 300) String tagline,
        @NotBlank String continent,
        @NotBlank @Size(max = 120) String country,
        @Positive int durationDays,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        @NotNull @DecimalMin("0.00") BigDecimal deposit,
        @Positive int capacity,
        @Size(max = 500) String coverImage,
        boolean published,
        List<@NotBlank @Size(max = 300) String> included,
        @Valid List<DestinationRequest> destinations,
        @Valid List<DayRequest> itinerary) {

    /**
     * Zdjęcie jest nieobowiązkowe — strona pokazuje wtedy grafikę zastępczą.
     *
     * <p>Kolumna w bazie pozostaje NOT NULL, więc brak adresu zapisujemy jako
     * pusty tekst. Dzięki temu „bez zdjęcia" nie wymaga zmiany schematu, a na
     * wyjściu i tak sprowadza się do tego samego: nie ma czego wyświetlić.
     */
    public TripUpsertRequest {
        coverImage = coverImage == null ? "" : coverImage.trim();
    }

    public record DestinationRequest(
            @PositiveOrZero int position,
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 60) String dayRange,
            @NotBlank @Size(max = 1000) String description,
            @Size(max = 500) String image) {

        public DestinationRequest {
            image = image == null ? "" : image.trim();
        }
    }

    public record DayRequest(
            @Positive int day,
            @NotBlank @Size(max = 160) String title,
            @NotBlank @Size(max = 2000) String description,
            List<@NotBlank @Size(max = 40) String> tags) {}
}
