package pl.czulapodroz.api.catalog;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.domain.Continent;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.inventory.SeatAvailability;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;

/** Odczytowa strona katalogu wyjazdów. */
@Service
public class TripCatalogService {

    private final TripRepository tripRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final TripMapper tripMapper;

    public TripCatalogService(
            TripRepository tripRepository,
            SeatAvailabilityService seatAvailabilityService,
            TripMapper tripMapper) {
        this.tripRepository = tripRepository;
        this.seatAvailabilityService = seatAvailabilityService;
        this.tripMapper = tripMapper;
    }

    @Transactional(readOnly = true)
    public List<TripResponse> listPublished(Continent continent) {
        List<Trip> trips =
                continent == null
                        ? tripRepository.findByPublishedTrueOrderByStartDateAsc()
                        : tripRepository.findByPublishedTrueAndContinentOrderByStartDateAsc(
                                continent);

        Map<UUID, SeatAvailability> availability = seatAvailabilityService.availabilityFor(trips);
        return trips.stream()
                .map(
                        trip ->
                                tripMapper.toResponse(
                                        trip,
                                        availability.getOrDefault(
                                                trip.getId(),
                                                SeatAvailability.of(
                                                        trip.getCapacity(),
                                                        trip.getBookedSeats(),
                                                        0))))
                .toList();
    }

    @Transactional(readOnly = true)
    public TripResponse getBySlug(String slug) {
        Trip trip = requireBySlug(slug);
        return tripMapper.toResponse(trip, seatAvailabilityService.availabilityFor(trip));
    }

    @Transactional(readOnly = true)
    public TripResponse.AvailabilityResponse availability(String slug) {
        Trip trip = requireBySlug(slug);
        SeatAvailability availability = seatAvailabilityService.availabilityFor(trip);
        return new TripResponse.AvailabilityResponse(
                availability.capacity(),
                availability.booked(),
                availability.held(),
                availability.available());
    }

    /** Encja wyjazdu dla pozostałych modułów (koszyk, zamówienia). */
    @Transactional(readOnly = true)
    public Trip requireBySlug(String slug) {
        return tripRepository.findBySlug(slug).orElseThrow(() -> NotFoundException.trip(slug));
    }
}
