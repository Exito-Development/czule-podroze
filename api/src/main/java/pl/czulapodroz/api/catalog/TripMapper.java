package pl.czulapodroz.api.catalog;

import java.util.List;
import org.springframework.stereotype.Component;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.catalog.domain.TripStatus;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.inventory.SeatAvailability;

/** Tłumaczy encje katalogu na odpowiedzi API. */
@Component
public class TripMapper {

    private final CatalogProperties catalogProperties;

    public TripMapper(CatalogProperties catalogProperties) {
        this.catalogProperties = catalogProperties;
    }

    public TripResponse toResponse(Trip trip, SeatAvailability availability) {
        return new TripResponse(
                trip.getSlug(),
                trip.getTitle(),
                trip.getTagline(),
                trip.getContinent().polishName(),
                trip.getCountry(),
                trip.getDurationDays(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getPrice(),
                trip.getDeposit(),
                trip.getCapacity(),
                trip.getCapacity() - availability.available(),
                status(trip, availability).apiValue(),
                trip.getCoverImage(),
                trip.getDestinations().stream()
                        .map(
                                destination ->
                                        new TripResponse.DestinationResponse(
                                                destination.getName(),
                                                destination.getDayRange(),
                                                destination.getDescription(),
                                                destination.getImage()))
                        .toList(),
                List.copyOf(trip.getIncluded()),
                trip.getItinerary().stream()
                        .map(
                                day ->
                                        new TripResponse.DayResponse(
                                                day.getDayNumber(),
                                                day.getTitle(),
                                                day.getDescription(),
                                                day.getTags()))
                        .toList(),
                new TripResponse.AvailabilityResponse(
                        availability.capacity(),
                        availability.booked(),
                        availability.held(),
                        availability.available()));
    }

    /**
     * Status sprzedaży wyliczany na bieżąco — nie da się go „zapomnieć"
     * zaktualizować po sprzedaży ostatniego miejsca.
     */
    public TripStatus status(Trip trip, SeatAvailability availability) {
        if (!trip.isPublished()) {
            return TripStatus.UPCOMING;
        }
        if (availability.soldOut()) {
            return TripStatus.SOLDOUT;
        }
        if (availability.available() <= catalogProperties.fewLeftThreshold()) {
            return TripStatus.FEW_LEFT;
        }
        return TripStatus.OPEN;
    }
}
