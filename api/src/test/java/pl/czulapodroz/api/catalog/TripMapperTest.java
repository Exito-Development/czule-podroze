package pl.czulapodroz.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.catalog.domain.TripStatus;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.inventory.SeatAvailability;
import pl.czulapodroz.api.support.TripFixtures;

@DisplayName("Mapowanie wyjazdu na odpowiedź API")
class TripMapperTest {

    private final TripMapper mapper = new TripMapper(new CatalogProperties(3));

    @Test
    @DisplayName("status wynika z dostępności, a nie z ręcznie ustawionego pola")
    void derivesStatusFromAvailability() {
        Trip trip = TripFixtures.trip("test", 10);

        assertThat(mapper.status(trip, SeatAvailability.of(10, 0, 0))).isEqualTo(TripStatus.OPEN);
        assertThat(mapper.status(trip, SeatAvailability.of(10, 7, 0)))
                .isEqualTo(TripStatus.FEW_LEFT);
        assertThat(mapper.status(trip, SeatAvailability.of(10, 10, 0)))
                .isEqualTo(TripStatus.SOLDOUT);
    }

    @Test
    @DisplayName("miejsca trzymane w koszykach też zmieniają status na „ostatnie miejsca”")
    void heldSeatsAffectStatus() {
        Trip trip = TripFixtures.trip("test", 10);

        assertThat(mapper.status(trip, SeatAvailability.of(10, 4, 4)))
                .isEqualTo(TripStatus.FEW_LEFT);
    }

    @Test
    @DisplayName("nieopublikowany wyjazd jest „wkrótce”, choćby miał komplet miejsc")
    void unpublishedTripIsUpcoming() {
        Trip trip = TripFixtures.trip("test", 10);
        trip.updateDetails(
                trip.getTitle(),
                trip.getTagline(),
                trip.getContinent(),
                trip.getCountry(),
                trip.getDurationDays(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getPrice(),
                trip.getDeposit(),
                trip.getCapacity(),
                trip.getCoverImage(),
                false);

        assertThat(mapper.status(trip, SeatAvailability.of(10, 0, 0)))
                .isEqualTo(TripStatus.UPCOMING);
    }

    @Test
    @DisplayName("`booked` w odpowiedzi obejmuje blokady, więc licznik „ile zostało” jest prawdziwy")
    void bookedFieldIncludesHolds() {
        Trip trip = TripFixtures.trip("test", 10);

        TripResponse response = mapper.toResponse(trip, SeatAvailability.of(10, 2, 3));

        assertThat(response.booked()).isEqualTo(5);
        assertThat(response.capacity() - response.booked()).isEqualTo(5);
        assertThat(response.availability().held()).isEqualTo(3);
        assertThat(response.continent()).isEqualTo("Azja");
        assertThat(response.status()).isEqualTo("open");
        assertThat(response.itinerary()).hasSize(2);
    }
}
