package pl.czulapodroz.api.catalog;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.domain.Continent;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.catalog.domain.TripDay;
import pl.czulapodroz.api.catalog.domain.TripDestination;
import pl.czulapodroz.api.catalog.web.dto.ItineraryUpdateRequest;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.catalog.web.dto.TripUpsertRequest;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;

/**
 * Zapisowa strona katalogu — to, czym steruje panel administracyjny.
 *
 * Trzymana osobno od {@link TripCatalogService}, bo ma inne reguły
 * (uprawnienia, walidacje spójności) i inny cykl zmian.
 */
@Service
public class TripAdminService {

    private final TripRepository tripRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final TripMapper tripMapper;

    public TripAdminService(
            TripRepository tripRepository,
            SeatAvailabilityService seatAvailabilityService,
            TripMapper tripMapper) {
        this.tripRepository = tripRepository;
        this.seatAvailabilityService = seatAvailabilityService;
        this.tripMapper = tripMapper;
    }

    @Transactional(readOnly = true)
    public List<TripResponse> listAll() {
        List<Trip> trips = tripRepository.findAllByOrderByStartDateAsc();
        var availability = seatAvailabilityService.availabilityFor(trips);
        return trips.stream()
                .map(trip -> tripMapper.toResponse(trip, availability.get(trip.getId())))
                .toList();
    }

    @Transactional
    public TripResponse create(TripUpsertRequest request) {
        if (tripRepository.existsBySlug(request.slug())) {
            throw new ConflictException(
                    "trip.slugTaken",
                    "Wyjazd o adresie \u201e%s\u201d ju\u017c istnieje".formatted(request.slug()));
        }
        validateDates(request);

        Trip trip =
                new Trip(
                        request.slug(),
                        request.title(),
                        request.tagline(),
                        continent(request.continent()),
                        request.country(),
                        request.durationDays(),
                        request.startDate(),
                        request.endDate(),
                        request.price(),
                        request.deposit(),
                        request.capacity(),
                        request.coverImage());
        apply(trip, request);
        Trip saved = tripRepository.save(trip);
        return tripMapper.toResponse(saved, seatAvailabilityService.availabilityFor(saved));
    }

    @Transactional
    public TripResponse update(String slug, TripUpsertRequest request) {
        Trip trip = tripRepository.findBySlug(slug).orElseThrow(() -> NotFoundException.trip(slug));
        validateDates(request);

        try {
            trip.updateDetails(
                    request.title(),
                    request.tagline(),
                    continent(request.continent()),
                    request.country(),
                    request.durationDays(),
                    request.startDate(),
                    request.endDate(),
                    request.price(),
                    request.deposit(),
                    request.capacity(),
                    request.coverImage(),
                    request.published());
        } catch (IllegalArgumentException exception) {
            throw new ConflictException("trip.capacityTooLow", exception.getMessage());
        }
        apply(trip, request);
        return tripMapper.toResponse(trip, seatAvailabilityService.availabilityFor(trip));
    }

    /** Podmiana samego planu dzień po dniu — najczęstsza operacja w panelu. */
    @Transactional
    public TripResponse replaceItinerary(String slug, ItineraryUpdateRequest request) {
        Trip trip = tripRepository.findBySlug(slug).orElseThrow(() -> NotFoundException.trip(slug));
        trip.replaceItinerary(toDays(request.days()));
        return tripMapper.toResponse(trip, seatAvailabilityService.availabilityFor(trip));
    }

    @Transactional
    public void delete(String slug) {
        Trip trip = tripRepository.findBySlug(slug).orElseThrow(() -> NotFoundException.trip(slug));
        if (trip.getBookedSeats() > 0) {
            throw new ConflictException(
                    "trip.hasBookings",
                    "Nie można usunąć wyjazdu, na który są już rezerwacje. "
                            + "Cofnij publikację zamiast usuwać.");
        }
        tripRepository.delete(trip);
    }

    private void apply(Trip trip, TripUpsertRequest request) {
        trip.replaceIncluded(request.included() == null ? List.of() : request.included());
        trip.replaceDestinations(
                request.destinations() == null
                        ? List.of()
                        : request.destinations().stream()
                                .map(
                                        destination ->
                                                new TripDestination(
                                                        destination.position(),
                                                        destination.name(),
                                                        destination.dayRange(),
                                                        destination.description(),
                                                        destination.image()))
                                .toList());
        trip.replaceItinerary(
                request.itinerary() == null ? List.of() : toDays(request.itinerary()));
    }

    private List<TripDay> toDays(List<TripUpsertRequest.DayRequest> days) {
        long distinctDays = days.stream().mapToInt(TripUpsertRequest.DayRequest::day).distinct().count();
        if (distinctDays != days.size()) {
            throw new BadRequestException(
                    "itinerary.duplicateDay", "Numery dni w planie nie mogą się powtarzać");
        }
        return days.stream()
                .map(day -> new TripDay(day.day(), day.title(), day.description(), day.tags()))
                .toList();
    }

    private Continent continent(String value) {
        try {
            return Continent.fromApiValue(value);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("continent.unknown", exception.getMessage());
        }
    }

    private void validateDates(TripUpsertRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException(
                    "trip.invalidDates", "Data zakończenia nie może być wcześniejsza niż rozpoczęcia");
        }
        if (request.deposit().compareTo(request.price()) > 0) {
            throw new BadRequestException(
                    "trip.invalidDeposit", "Zadatek nie może być wyższy niż cena wyjazdu");
        }
    }
}
