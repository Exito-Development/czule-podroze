package pl.czulapodroz.api.order;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.cart.CartRepository;
import pl.czulapodroz.api.cart.CartService;
import pl.czulapodroz.api.cart.domain.Cart;
import pl.czulapodroz.api.cart.domain.CartItem;
import pl.czulapodroz.api.common.config.FrontendProperties;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.common.util.SecureTokens;
import pl.czulapodroz.api.inventory.BookingProperties;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.order.domain.Customer;
import pl.czulapodroz.api.order.domain.OrderItem;
import pl.czulapodroz.api.order.domain.TripOrder;
import pl.czulapodroz.api.order.web.dto.OrderDtos;

/**
 * Składanie zamówień.
 *
 * Zamówienie powstaje z koszyka i tylko wtedy, gdy blokady miejsc wciąż
 * obowiązują. Jeśli któraś wygasła w trakcie wypełniania formularza,
 * próbujemy ją odtworzyć — a gdy miejsc już nie ma, zamówienie nie powstaje
 * i klientka dostaje jasny komunikat wraz z liczbą wolnych miejsc.
 */
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final int ACCESS_TOKEN_BYTES = 32;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final TripRepository tripRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final OrderMapper orderMapper;
    private final BookingProperties bookingProperties;
    private final FrontendProperties frontendProperties;
    private final Clock clock;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartService cartService,
            TripRepository tripRepository,
            SeatAvailabilityService seatAvailabilityService,
            OrderMapper orderMapper,
            BookingProperties bookingProperties,
            FrontendProperties frontendProperties,
            Clock clock) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.tripRepository = tripRepository;
        this.seatAvailabilityService = seatAvailabilityService;
        this.orderMapper = orderMapper;
        this.bookingProperties = bookingProperties;
        this.frontendProperties = frontendProperties;
        this.clock = clock;
    }

    @Transactional
    public OrderDtos.PlacedOrderResponse placeOrder(
            OrderDtos.PlaceOrderRequest request, UUID userId) {
        Cart cart = cartService.requireCart(request.cartId());
        if (!cart.isEditable()) {
            throw new ConflictException(
                    "cart.alreadyOrdered", "Ten koszyk został już zamieniony na zamówienie");
        }
        if (cart.getItems().isEmpty()) {
            throw new ConflictException("cart.empty", "Koszyk jest pusty");
        }

        Instant now = clock.instant();
        String accessToken = SecureTokens.generate(ACCESS_TOKEN_BYTES);
        TripOrder order =
                new TripOrder(
                        nextOrderNumber(),
                        cart.getId(),
                        userId,
                        toCustomer(request.customer()),
                        SecureTokens.hash(accessToken),
                        now.plus(bookingProperties.paymentWindow()));

        for (CartItem item : cart.getItems()) {
            // Blokada wiersza + ponowne potwierdzenie miejsc: między dodaniem
            // do koszyka a kasą mogło minąć sporo czasu.
            Trip trip =
                    tripRepository
                            .lockById(item.getTrip().getId())
                            .orElseThrow(() -> NotFoundException.trip(item.getTrip().getSlug()));
            seatAvailabilityService.placeHold(trip, cart.getId(), item.getSeats());
            order.addItem(new OrderItem(order, trip, item.getSeats(), item.getPaymentMode()));
        }

        TripOrder saved = orderRepository.save(order);
        seatAvailabilityService.attachHoldsToOrder(cart.getId(), saved.getId());
        cart.markOrdered();
        cartRepository.save(cart);

        log.info(
                "Złożono zamówienie {} na kwotę {} {}",
                saved.getOrderNumber(),
                saved.getAmountDueNow(),
                saved.getCurrency());

        return new OrderDtos.PlacedOrderResponse(
                orderMapper.toResponse(saved),
                accessToken,
                frontendProperties.reservationUrl(saved.getOrderNumber(), accessToken));
    }

    @Transactional(readOnly = true)
    public TripOrder requireByNumber(String orderNumber) {
        return orderRepository
                .findByOrderNumber(orderNumber)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "order.notFound", "Nie znaleziono zamówienia " + orderNumber));
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderResponse> listForUser(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderResponse> listAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    /** Numer zamówienia widoczny dla klientki, np. `CP-2026-AC3K9X`. */
    private String nextOrderNumber() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String candidate =
                    "CP-%d-%s"
                            .formatted(
                                    clock.instant().atZone(java.time.ZoneOffset.UTC).getYear(),
                                    SecureTokens.generateCode(6));
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Nie udało się wygenerować numeru zamówienia");
    }

    private Customer toCustomer(OrderDtos.CustomerRequest request) {
        return new Customer(
                request.firstName().trim(),
                request.lastName().trim(),
                request.email().trim().toLowerCase(java.util.Locale.ROOT),
                request.phone(),
                request.note());
    }
}
