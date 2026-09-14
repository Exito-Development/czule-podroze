package pl.czulapodroz.api.support;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import pl.czulapodroz.api.catalog.domain.Continent;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.catalog.domain.TripDay;

/** Gotowe wyjazdy do testów — czytelne i jednoznaczne dane. */
public final class TripFixtures {

    private TripFixtures() {}

    /** Wyjazd z podaną pojemnością, ceną 10 000 zł i zadatkiem 2 000 zł. */
    public static Trip trip(String slug, int capacity) {
        Trip trip =
                new Trip(
                        slug,
                        "Wyjazd " + slug,
                        "Testowy wyjazd",
                        Continent.ASIA,
                        "Tajlandia",
                        7,
                        LocalDate.of(2027, 3, 1),
                        LocalDate.of(2027, 3, 7),
                        new BigDecimal("10000.00"),
                        new BigDecimal("2000.00"),
                        capacity,
                        "https://example.test/cover.jpg");
        trip.replaceIncluded(List.of("Warsztaty", "Noclegi"));
        trip.replaceItinerary(
                List.of(
                        new TripDay(1, "Powitanie", "Transfer i kolacja", List.of("relaks")),
                        new TripDay(2, "Warsztat", "Pierwsza sesja", List.of("warsztat"))));
        return trip;
    }
}
