package pl.czulapodroz.api.inventory;

import java.time.Clock;
import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.inventory.domain.SeatHold;

/**
 * Jedyne miejsce, w którym przyznajemy i zwalniamy miejsca na wyjazdach.
 *
 * Kontrakt: zanim zawołasz {@link #placeHold} albo {@link #convertHoldsToSeats},
 * musisz mieć wyjazd pobrany z blokadą wiersza
 * ({@code TripRepository.lockById}). Sprawdzenie dostępności i zapis blokady
 * dzieją się wtedy w jednej transakcji pod tą samą blokadą, więc nie da się
 * sprzedać tego samego miejsca dwa razy.
 */
@Service
public class SeatAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(SeatAvailabilityService.class);

    private final SeatHoldRepository seatHoldRepository;
    private final BookingProperties bookingProperties;
    private final Clock clock;

    public SeatAvailabilityService(
            SeatHoldRepository seatHoldRepository,
            BookingProperties bookingProperties,
            Clock clock) {
        this.seatHoldRepository = seatHoldRepository;
        this.bookingProperties = bookingProperties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public SeatAvailability availabilityFor(Trip trip) {
        int held = seatHoldRepository.sumActiveSeats(trip.getId(), clock.instant());
        return SeatAvailability.of(trip.getCapacity(), trip.getBookedSeats(), held);
    }

    /** Dostępność widziana „oczami" danego koszyka — bez jego własnej blokady. */
    @Transactional(readOnly = true)
    public SeatAvailability availabilityForCart(Trip trip, UUID cartId) {
        int held =
                seatHoldRepository.sumActiveSeatsExcludingCart(
                        trip.getId(), cartId, clock.instant());
        return SeatAvailability.of(trip.getCapacity(), trip.getBookedSeats(), held);
    }

    /** Zbiorczo dla listy ofert — jedno zapytanie zamiast N. */
    @Transactional(readOnly = true)
    public Map<UUID, SeatAvailability> availabilityFor(Collection<Trip> trips) {
        if (trips.isEmpty()) {
            return Map.of();
        }
        List<UUID> ids = trips.stream().map(Trip::getId).toList();
        Map<UUID, Integer> heldByTrip =
                seatHoldRepository.sumActiveSeatsByTrip(ids, clock.instant()).stream()
                        .collect(
                                Collectors.toMap(
                                        SeatHoldRepository.HeldSeatsByTrip::getTripId,
                                        SeatHoldRepository.HeldSeatsByTrip::getSeats));

        Map<UUID, SeatAvailability> result = new HashMap<>();
        for (Trip trip : trips) {
            result.put(
                    trip.getId(),
                    SeatAvailability.of(
                            trip.getCapacity(),
                            trip.getBookedSeats(),
                            heldByTrip.getOrDefault(trip.getId(), 0)));
        }
        return Map.copyOf(result);
    }

    /**
     * Zakłada (albo powiększa) blokadę miejsc dla koszyka.
     *
     * @throws SeatsUnavailableException gdy w puli nie ma tylu wolnych miejsc
     */
    @Transactional
    public SeatHold placeHold(Trip lockedTrip, UUID cartId, int seats) {
        if (seats <= 0) {
            throw new IllegalArgumentException("Liczba miejsc musi być dodatnia");
        }

        Instant now = clock.instant();
        SeatAvailability availability = availabilityForCart(lockedTrip, cartId);
        if (seats > availability.available()) {
            throw new SeatsUnavailableException(
                    lockedTrip.getSlug(), seats, availability.available());
        }

        Instant expiry = now.plus(bookingProperties.holdDuration());
        SeatHold hold =
                seatHoldRepository
                        .findByCartIdAndTripId(cartId, lockedTrip.getId())
                        .orElseGet(() -> new SeatHold(lockedTrip, cartId, seats, expiry));
        hold.resize(seats, expiry);

        log.debug(
                "Blokada {} miejsc na wyjeździe {} dla koszyka {} do {}",
                seats,
                lockedTrip.getSlug(),
                cartId,
                expiry);
        return seatHoldRepository.save(hold);
    }

    @Transactional
    public void releaseHold(UUID cartId, UUID tripId) {
        seatHoldRepository
                .findByCartIdAndTripId(cartId, tripId)
                .ifPresent(
                        hold -> {
                            hold.release();
                            seatHoldRepository.save(hold);
                        });
    }

    @Transactional
    public void releaseHoldsForCart(UUID cartId) {
        List<SeatHold> holds = seatHoldRepository.findByCartId(cartId);
        holds.forEach(SeatHold::release);
        seatHoldRepository.saveAll(holds);
    }

    /** Przypina blokady koszyka do zamówienia i przedłuża je na czas płatności. */
    @Transactional
    public void attachHoldsToOrder(UUID cartId, UUID orderId) {
        Instant deadline = clock.instant().plus(bookingProperties.paymentWindow());
        List<SeatHold> holds = seatHoldRepository.findByCartId(cartId);
        holds.stream()
                .filter(hold -> hold.isActiveAt(clock.instant()))
                .forEach(hold -> hold.attachToOrder(orderId, deadline));
        seatHoldRepository.saveAll(holds);
    }

    /** Sprawdza, czy blokada koszyka dla wyjazdu wciąż obowiązuje. */
    @Transactional(readOnly = true)
    public Optional<SeatHold> activeHold(UUID cartId, UUID tripId) {
        return seatHoldRepository
                .findByCartIdAndTripId(cartId, tripId)
                .filter(hold -> hold.isActiveAt(clock.instant()));
    }

    @Transactional(readOnly = true)
    public List<SeatHold> holdsForOrder(UUID orderId) {
        return seatHoldRepository.findByOrderId(orderId);
    }

    /**
     * Zamienia blokady opłaconego zamówienia w miejsca zajęte na stałe.
     *
     * Wywoływane po potwierdzeniu płatności; wyjazdy muszą być w tej samej
     * transakcji pobrane z blokadą wiersza.
     */
    @Transactional
    public void convertHoldsToSeats(UUID orderId, Function<UUID, Trip> lockedTripSupplier) {
        for (SeatHold hold : seatHoldRepository.findByOrderId(orderId)) {
            if (hold.getStatus() == pl.czulapodroz.api.inventory.domain.SeatHoldStatus.CONVERTED) {
                continue;
            }
            Trip trip = lockedTripSupplier.apply(hold.getTrip().getId());
            trip.confirmSeats(hold.getSeats());
            hold.convert();
            seatHoldRepository.save(hold);
        }
    }

    /** Sprzątanie blokad, których czas minął. Zwraca liczbę wygaszonych wpisów. */
    @Transactional
    public int expireOutdatedHolds() {
        return seatHoldRepository.expireOutdated(clock.instant());
    }
}
