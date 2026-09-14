package pl.czulapodroz.api.order;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripMapper;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.common.util.SecureTokens;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.order.domain.OrderItem;
import pl.czulapodroz.api.order.domain.TripOrder;
import pl.czulapodroz.api.order.web.dto.OrderDtos;

/**
 * Podgląd rezerwacji dla klientki.
 *
 * Dwie drogi dostępu: token z linku (zakup bez konta) albo zalogowane konto.
 * Obie kończą się tym samym widokiem — zamówienie plus komplet informacji
 * o wyjeździe: plan dzień po dniu, destynacje i „co w cenie".
 *
 * Gdy token się nie zgadza, odpowiadamy tak samo jak dla nieistniejącego
 * zamówienia (404), żeby nie dało się sprawdzać, które numery istnieją.
 */
@Service
public class ReservationService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final TripMapper tripMapper;
    private final SeatAvailabilityService seatAvailabilityService;

    public ReservationService(
            OrderRepository orderRepository,
            OrderMapper orderMapper,
            TripMapper tripMapper,
            SeatAvailabilityService seatAvailabilityService) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.tripMapper = tripMapper;
        this.seatAvailabilityService = seatAvailabilityService;
    }

    @Transactional(readOnly = true)
    public OrderDtos.ReservationResponse getByToken(String orderNumber, String accessToken) {
        TripOrder order =
                orderRepository
                        .findByOrderNumber(orderNumber)
                        .filter(
                                candidate ->
                                        SecureTokens.matches(
                                                accessToken, candidate.getAccessTokenHash()))
                        .orElseThrow(ReservationService::notFound);
        return toReservation(order);
    }

    @Transactional(readOnly = true)
    public OrderDtos.ReservationResponse getForUser(String orderNumber, UUID userId) {
        TripOrder order =
                orderRepository
                        .findByOrderNumber(orderNumber)
                        .filter(candidate -> userId.equals(candidate.getUserId()))
                        .orElseThrow(ReservationService::notFound);
        return toReservation(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderResponse> listForUser(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    private OrderDtos.ReservationResponse toReservation(TripOrder order) {
        List<TripResponse> trips =
                order.getItems().stream()
                        .map(OrderItem::getTrip)
                        .map(
                                trip ->
                                        tripMapper.toResponse(
                                                trip,
                                                seatAvailabilityService.availabilityFor(trip)))
                        .toList();
        return new OrderDtos.ReservationResponse(orderMapper.toResponse(order), trips);
    }

    private static NotFoundException notFound() {
        return new NotFoundException(
                "reservation.notFound", "Nie znaleziono rezerwacji o podanym numerze i tokenie");
    }
}
