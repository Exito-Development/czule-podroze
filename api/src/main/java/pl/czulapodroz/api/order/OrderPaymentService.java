package pl.czulapodroz.api.order;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.order.domain.OrderStatus;
import pl.czulapodroz.api.order.domain.TripOrder;

/**
 * Wpływ płatności na zamówienie — punkt styku modułu płatności z zamówieniami.
 *
 * Moduł płatności nie wie nic o miejscach ani o koszyku; woła tylko
 * {@link #confirmPayment}, a cała reszta (zamiana blokad na miejsca zajęte,
 * zamknięcie zamówienia) dzieje się tutaj, w jednej transakcji.
 */
@Service
public class OrderPaymentService {

    private static final Logger log = LoggerFactory.getLogger(OrderPaymentService.class);

    private final OrderRepository orderRepository;
    private final TripRepository tripRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final Clock clock;

    public OrderPaymentService(
            OrderRepository orderRepository,
            TripRepository tripRepository,
            SeatAvailabilityService seatAvailabilityService,
            Clock clock) {
        this.orderRepository = orderRepository;
        this.tripRepository = tripRepository;
        this.seatAvailabilityService = seatAvailabilityService;
        this.clock = clock;
    }

    /**
     * Księguje wpłatę i zamienia blokady miejsc w miejsca zajęte na stałe.
     *
     * Operacja jest idempotentna — powtórzone powiadomienie od operatora
     * (a takie się zdarzają) nie policzy miejsc drugi raz.
     */
    @Transactional
    public void confirmPayment(UUID orderId, BigDecimal amount) {
        TripOrder order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "order.notFound", "Nie znaleziono zamówienia"));

        if (order.isPaid()) {
            log.info("Zamówienie {} było już opłacone — pomijam", order.getOrderNumber());
            return;
        }

        if (!order.markPaid(amount, clock.instant())) {
            return;
        }

        seatAvailabilityService.convertHoldsToSeats(
                order.getId(),
                tripId ->
                        tripRepository
                                .lockById(tripId)
                                .orElseThrow(
                                        () ->
                                                new NotFoundException(
                                                        "trip.notFound",
                                                        "Nie znaleziono wyjazdu " + tripId)));

        orderRepository.save(order);
        log.info("Zamówienie {} opłacone — miejsca przyznane", order.getOrderNumber());
    }

    /** Zamówienia, których nie opłacono w wyznaczonym czasie. */
    @Transactional
    public int expireUnpaidOrders() {
        List<TripOrder> stale =
                orderRepository.findByStatusAndPaymentDeadlineBefore(
                        OrderStatus.PENDING_PAYMENT, clock.instant());
        for (TripOrder order : stale) {
            order.expire(clock.instant());
            seatAvailabilityService.releaseHoldsForCart(order.getCartId());
        }
        orderRepository.saveAll(stale);
        return stale.size();
    }

    /** Pomocnicze dla panelu: ręczne anulowanie nieopłaconego zamówienia. */
    @Transactional
    public void cancel(String orderNumber) {
        TripOrder order =
                orderRepository
                        .findByOrderNumber(orderNumber)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "order.notFound", "Nie znaleziono zamówienia"));
        order.cancel(clock.instant());
        seatAvailabilityService.releaseHoldsForCart(order.getCartId());
        orderRepository.save(order);
    }

    /** Widoczne dla testów i diagnostyki: zajętość wyjazdu po potwierdzeniu. */
    @Transactional(readOnly = true)
    public int bookedSeats(String tripSlug) {
        return tripRepository.findBySlug(tripSlug).map(Trip::getBookedSeats).orElse(0);
    }
}
