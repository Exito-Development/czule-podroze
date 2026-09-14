package pl.czulapodroz.api.inventory;

import java.util.Map;
import pl.czulapodroz.api.common.error.ConflictException;

/** Brak wystarczającej liczby wolnych miejsc w chwili rezerwacji. */
public class SeatsUnavailableException extends ConflictException {

    public SeatsUnavailableException(String tripSlug, int requested, int available) {
        super(
                "seats.unavailable",
                available == 0
                        ? "Na ten wyjazd nie ma już wolnych miejsc."
                        : "Zostało tylko %d wolnych miejsc — wybierz mniejszą liczbę."
                                .formatted(available),
                Map.of("tripSlug", tripSlug, "requested", requested, "available", available));
    }
}
