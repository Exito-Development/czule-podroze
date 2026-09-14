package pl.czulapodroz.api.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Dostępność miejsc")
class SeatAvailabilityTest {

    @Test
    @DisplayName("odejmuje od pojemności zarówno miejsca opłacone, jak i trzymane w koszykach")
    void countsBookedAndHeldSeats() {
        SeatAvailability availability = SeatAvailability.of(10, 4, 3);

        assertThat(availability.available()).isEqualTo(3);
        assertThat(availability.soldOut()).isFalse();
    }

    @Test
    @DisplayName("nigdy nie schodzi poniżej zera, nawet gdy dane są niespójne")
    void neverGoesNegative() {
        SeatAvailability availability = SeatAvailability.of(10, 8, 5);

        assertThat(availability.available()).isZero();
        assertThat(availability.soldOut()).isTrue();
    }

    @Test
    @DisplayName("komplet blokad oznacza brak miejsc")
    void allSeatsHeldMeansSoldOut() {
        assertThat(SeatAvailability.of(4, 0, 4).soldOut()).isTrue();
    }
}
