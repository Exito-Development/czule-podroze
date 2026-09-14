package pl.czulapodroz.api.dashboard;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripMapper;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.dashboard.web.dto.DashboardDtos;
import pl.czulapodroz.api.inventory.SeatAvailability;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.order.OrderRepository;
import pl.czulapodroz.api.order.domain.OrderItem;
import pl.czulapodroz.api.order.domain.OrderStatus;
import pl.czulapodroz.api.order.domain.TripOrder;
import pl.czulapodroz.api.participants.ParticipantRepository;
import pl.czulapodroz.api.participants.domain.Participant;
import pl.czulapodroz.api.participants.domain.ParticipantStatus;
import pl.czulapodroz.api.waitlist.WaitlistRepository;

/**
 * Pulpit organizatorek — jedno spojrzenie na stan sprzedaży.
 *
 * To widok wyłącznie do odczytu, sklejony z kilku modułów. Trzymamy go osobno,
 * bo żaden z tych modułów nie powinien znać pozostałych tylko po to, żeby
 * policzyć wspólne podsumowanie.
 */
@Service
public class DashboardService {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");
    private static final int RECENT_ORDERS = 8;

    private final TripRepository tripRepository;
    private final OrderRepository orderRepository;
    private final WaitlistRepository waitlistRepository;
    private final ParticipantRepository participantRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final TripMapper tripMapper;
    private final Clock clock;

    public DashboardService(
            TripRepository tripRepository,
            OrderRepository orderRepository,
            WaitlistRepository waitlistRepository,
            ParticipantRepository participantRepository,
            SeatAvailabilityService seatAvailabilityService,
            TripMapper tripMapper,
            Clock clock) {
        this.tripRepository = tripRepository;
        this.orderRepository = orderRepository;
        this.waitlistRepository = waitlistRepository;
        this.participantRepository = participantRepository;
        this.seatAvailabilityService = seatAvailabilityService;
        this.tripMapper = tripMapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardDtos.SummaryResponse summary() {
        List<Trip> trips = tripRepository.findAllByOrderByStartDateAsc();
        List<TripOrder> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        Map<UUID, SeatAvailability> availability = seatAvailabilityService.availabilityFor(trips);
        LocalDate today = LocalDate.ofInstant(clock.instant(), WARSAW);

        List<DashboardDtos.TripRow> tripRows =
                trips.stream()
                        .map(trip -> toTripRow(trip, orders, availability.get(trip.getId())))
                        .toList();

        BigDecimal revenuePaid =
                orders.stream()
                        .filter(TripOrder::isPaid)
                        .map(TripOrder::getAmountPaid)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outstanding =
                orders.stream()
                        .filter(TripOrder::isPaid)
                        .map(TripOrder::balanceDue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        int incomplete =
                (int)
                        participantRepository.findAll().stream()
                                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                                .filter(Participant::isIncomplete)
                                .count();

        return new DashboardDtos.SummaryResponse(
                (int) trips.stream().filter(Trip::isPublished).count(),
                (int) trips.stream().filter(trip -> trip.getStartDate().isAfter(today)).count(),
                trips.stream().mapToInt(Trip::getBookedSeats).sum(),
                trips.stream().mapToInt(Trip::getCapacity).sum(),
                (int) orders.stream().filter(TripOrder::isPaid).count(),
                (int)
                        orders.stream()
                                .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                                .count(),
                revenuePaid,
                outstanding,
                (int) waitlistRepository.count(),
                incomplete,
                tripRows,
                orders.stream().limit(RECENT_ORDERS).map(DashboardService::toOrderRow).toList());
    }

    private DashboardDtos.TripRow toTripRow(
            Trip trip, List<TripOrder> orders, SeatAvailability availability) {
        SeatAvailability seats =
                availability == null
                        ? SeatAvailability.of(trip.getCapacity(), trip.getBookedSeats(), 0)
                        : availability;

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal outstanding = BigDecimal.ZERO;
        for (TripOrder order : orders) {
            if (!order.isPaid() || !touches(order, trip)) {
                continue;
            }
            revenue = revenue.add(order.getAmountPaid());
            outstanding = outstanding.add(order.balanceDue());
        }

        return new DashboardDtos.TripRow(
                trip.getSlug(),
                trip.getTitle(),
                trip.getStartDate(),
                tripMapper.status(trip, seats).apiValue(),
                trip.getCapacity(),
                trip.getBookedSeats(),
                seats.held(),
                seats.available(),
                (int) waitlistRepository.countByTripId(trip.getId()),
                revenue,
                outstanding);
    }

    private static boolean touches(TripOrder order, Trip trip) {
        return order.getItems().stream()
                .anyMatch(item -> item.getTrip().getId().equals(trip.getId()));
    }

    private static DashboardDtos.RecentOrderRow toOrderRow(TripOrder order) {
        return new DashboardDtos.RecentOrderRow(
                order.getOrderNumber(),
                order.getCustomer().fullName(),
                order.getCustomer().getEmail(),
                order.getStatus().name(),
                order.getAmountDueNow(),
                order.getAmountPaid(),
                order.getCreatedAt().toString(),
                order.getItems().stream().map(OrderItem::getTripTitle).toList());
    }
}
