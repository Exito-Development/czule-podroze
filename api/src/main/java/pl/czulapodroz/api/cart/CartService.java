package pl.czulapodroz.api.cart;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.cart.domain.Cart;
import pl.czulapodroz.api.cart.domain.CartItem;
import pl.czulapodroz.api.cart.web.dto.CartDtos;
import pl.czulapodroz.api.common.domain.PaymentMode;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.inventory.BookingProperties;
import pl.czulapodroz.api.inventory.SeatAvailability;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.inventory.domain.SeatHold;

/**
 * Koszyk z rezerwacją miejsc.
 *
 * Dodanie wyjazdu do koszyka nie jest deklaracją chęci, tylko realną blokadą:
 * miejsca znikają z puli dostępnej dla innych na czas zakupów. Dlatego każda
 * zmiana pozycji przechodzi przez blokadę wiersza wyjazdu — sprawdzenie
 * dostępności i zapis blokady dzieją się atomowo.
 */
@Service
public class CartService {

    private final CartRepository cartRepository;
    private final TripRepository tripRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final BookingProperties bookingProperties;
    private final Clock clock;

    public CartService(
            CartRepository cartRepository,
            TripRepository tripRepository,
            SeatAvailabilityService seatAvailabilityService,
            BookingProperties bookingProperties,
            Clock clock) {
        this.cartRepository = cartRepository;
        this.tripRepository = tripRepository;
        this.seatAvailabilityService = seatAvailabilityService;
        this.bookingProperties = bookingProperties;
        this.clock = clock;
    }

    @Transactional
    public CartDtos.CartResponse createCart(UUID userId) {
        Cart cart = cartRepository.save(userId == null ? new Cart() : new Cart(userId));
        return toResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartDtos.CartResponse getCart(UUID cartId) {
        return toResponse(requireCart(cartId));
    }

    @Transactional
    public CartDtos.CartResponse addItem(UUID cartId, CartDtos.AddItemRequest request) {
        Cart cart = requireEditableCart(cartId);
        PaymentMode paymentMode = parsePaymentMode(request.paymentMode());
        validateSeats(request.seats());

        // Blokada wiersza wyjazdu: od tego momentu nikt inny nie policzy
        // tych samych wolnych miejsc aż do końca naszej transakcji.
        Trip trip =
                tripRepository
                        .lockBySlug(request.tripSlug())
                        .orElseThrow(() -> NotFoundException.trip(request.tripSlug()));
        if (!trip.isPublished()) {
            throw new ConflictException(
                    "trip.notBookable", "Sprzedaż tego wyjazdu jeszcze się nie rozpoczęła");
        }

        seatAvailabilityService.placeHold(trip, cart.getId(), request.seats());
        cart.putItem(trip, request.seats(), paymentMode);
        return toResponse(cart);
    }

    @Transactional
    public CartDtos.CartResponse updateItem(
            UUID cartId, UUID itemId, CartDtos.UpdateItemRequest request) {
        Cart cart = requireEditableCart(cartId);
        CartItem item =
                cart.findItem(itemId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "cart.itemNotFound",
                                                "Nie znaleziono pozycji w koszyku"));
        validateSeats(request.seats());
        PaymentMode paymentMode =
                request.paymentMode() == null
                        ? item.getPaymentMode()
                        : parsePaymentMode(request.paymentMode());

        Trip trip =
                tripRepository
                        .lockById(item.getTrip().getId())
                        .orElseThrow(() -> NotFoundException.trip(item.getTrip().getSlug()));

        seatAvailabilityService.placeHold(trip, cart.getId(), request.seats());
        item.update(request.seats(), paymentMode);
        return toResponse(cart);
    }

    @Transactional
    public CartDtos.CartResponse removeItem(UUID cartId, UUID itemId) {
        Cart cart = requireEditableCart(cartId);
        CartItem item =
                cart.findItem(itemId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "cart.itemNotFound",
                                                "Nie znaleziono pozycji w koszyku"));
        seatAvailabilityService.releaseHold(cart.getId(), item.getTrip().getId());
        cart.removeItem(item);
        return toResponse(cart);
    }

    /**
     * Odświeża blokady miejsc dla całego koszyka.
     *
     * Woła się przy wejściu do kasy: jeżeli w międzyczasie blokada wygasła,
     * próbujemy odtworzyć ją na tych samych warunkach. Gdy miejsc już nie ma,
     * klientka dowiaduje się o tym przed wypełnieniem formularza, a nie po.
     */
    @Transactional
    public CartDtos.CartResponse refreshHolds(UUID cartId) {
        Cart cart = requireEditableCart(cartId);
        for (CartItem item : cart.getItems()) {
            Trip trip =
                    tripRepository
                            .lockById(item.getTrip().getId())
                            .orElseThrow(() -> NotFoundException.trip(item.getTrip().getSlug()));
            seatAvailabilityService.placeHold(trip, cart.getId(), item.getSeats());
        }
        return toResponse(cart);
    }

    @Transactional(readOnly = true)
    public Cart requireCart(UUID cartId) {
        return cartRepository
                .findById(cartId)
                .orElseThrow(
                        () -> new NotFoundException("cart.notFound", "Nie znaleziono koszyka"));
    }

    private Cart requireEditableCart(UUID cartId) {
        Cart cart = requireCart(cartId);
        if (!cart.isEditable()) {
            throw new ConflictException(
                    "cart.notEditable",
                    "Ten koszyk został już zamieniony na zamówienie — zacznij nowy");
        }
        return cart;
    }

    private void validateSeats(int seats) {
        if (seats > bookingProperties.maxSeatsPerItem()) {
            throw new BadRequestException(
                    "cart.tooManySeats",
                    "Maksymalnie %d miejsca w jednej rezerwacji. Napisz do nas, jeśli jedziecie większą grupą."
                            .formatted(bookingProperties.maxSeatsPerItem()));
        }
    }

    private PaymentMode parsePaymentMode(String value) {
        if (value == null || value.isBlank()) {
            return PaymentMode.DEPOSIT;
        }
        try {
            return PaymentMode.valueOf(value.trim().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "cart.unknownPaymentMode", "Nieznany sposób płatności: " + value);
        }
    }

    public CartDtos.CartResponse toResponse(Cart cart) {
        Instant now = clock.instant();
        List<CartDtos.CartItemResponse> items =
                cart.getItems().stream()
                        .map(item -> toItemResponse(cart, item, now))
                        .toList();

        BigDecimal totalDueNow =
                items.stream()
                        .map(CartDtos.CartItemResponse::amountDueNow)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTripValue =
                items.stream()
                        .map(CartDtos.CartItemResponse::tripTotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        Instant holdExpiresAt =
                items.stream()
                        .map(CartDtos.CartItemResponse::holdExpiresAt)
                        .filter(java.util.Objects::nonNull)
                        .min(Comparator.naturalOrder())
                        .orElse(null);

        return new CartDtos.CartResponse(
                cart.getId().toString(),
                cart.getStatus().name(),
                items,
                totalDueNow,
                totalTripValue,
                holdExpiresAt);
    }

    private CartDtos.CartItemResponse toItemResponse(Cart cart, CartItem item, Instant now) {
        Trip trip = item.getTrip();
        BigDecimal seats = BigDecimal.valueOf(item.getSeats());
        BigDecimal amountDueNow =
                item.getPaymentMode()
                        .amountDuePerSeat(trip.getPrice(), trip.getDeposit())
                        .multiply(seats);

        Optional<SeatHold> hold = seatAvailabilityService.activeHold(cart.getId(), trip.getId());
        SeatAvailability availability =
                seatAvailabilityService.availabilityForCart(trip, cart.getId());

        return new CartDtos.CartItemResponse(
                item.getId().toString(),
                trip.getSlug(),
                trip.getTitle(),
                trip.getCoverImage(),
                item.getSeats(),
                item.getPaymentMode().name(),
                trip.getPrice(),
                trip.getDeposit(),
                amountDueNow,
                trip.getPrice().multiply(seats),
                availability.available(),
                hold.isPresent(),
                hold.map(SeatHold::getExpiresAt).orElse(null));
    }
}
