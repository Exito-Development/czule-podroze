package pl.czulapodroz.api.catalog.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pl.czulapodroz.api.support.TripFixtures;

@DisplayName("Wyjazd")
class TripTest {

    @Test
    @DisplayName("nie pozwala zająć więcej miejsc, niż ma pojemności")
    void rejectsOverbooking() {
        Trip trip = TripFixtures.trip("test", 4);
        trip.confirmSeats(3);

        assertThatThrownBy(() -> trip.confirmSeats(2))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("pojemno");

        assertThat(trip.getBookedSeats()).isEqualTo(3);
    }

    @Test
    @DisplayName("zwalnia miejsca, ale nie schodzi poniżej zera")
    void releasesSeatsSafely() {
        Trip trip = TripFixtures.trip("test", 10);
        trip.confirmSeats(2);
        trip.releaseSeats(5);

        assertThat(trip.getBookedSeats()).isZero();
    }

    @Test
    @DisplayName("porządkuje plan po numerze dnia, niezależnie od kolejności zapisu")
    void sortsItineraryByDayNumber() {
        Trip trip = TripFixtures.trip("test", 10);

        trip.replaceItinerary(
                List.of(
                        new TripDay(3, "Trzeci", "opis", List.of()),
                        new TripDay(1, "Pierwszy", "opis", List.of()),
                        new TripDay(2, "Drugi", "opis", List.of())));

        assertThat(trip.getItinerary()).extracting(TripDay::getDayNumber).containsExactly(1, 2, 3);
    }

    @Test
    @DisplayName("nie pozwala zmniejszyć pojemności poniżej liczby sprzedanych miejsc")
    void rejectsCapacityBelowSoldSeats() {
        Trip trip = TripFixtures.trip("test", 10);
        trip.confirmSeats(6);

        assertThatThrownBy(
                        () ->
                                trip.updateDetails(
                                        "Nowy tytuł",
                                        "Nowe hasło",
                                        Continent.EUROPE,
                                        "Portugalia",
                                        6,
                                        LocalDate.of(2027, 5, 1),
                                        LocalDate.of(2027, 5, 6),
                                        new BigDecimal("8000.00"),
                                        new BigDecimal("1000.00"),
                                        4,
                                        "https://example.test/x.jpg",
                                        true))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
