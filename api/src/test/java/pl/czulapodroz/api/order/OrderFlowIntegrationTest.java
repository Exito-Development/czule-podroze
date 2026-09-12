package pl.czulapodroz.api.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.cart.CartService;
import pl.czulapodroz.api.cart.web.dto.CartDtos;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.inventory.SeatsUnavailableException;
import pl.czulapodroz.api.order.domain.OrderStatus;
import pl.czulapodroz.api.order.web.dto.OrderDtos;
import pl.czulapodroz.api.payment.PaymentService;
import pl.czulapodroz.api.payment.web.dto.PaymentDtos;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.MutableClock;
import pl.czulapodroz.api.support.TripFixtures;

@IntegrationTest
@Transactional
@DisplayName("Ścieżka zamówienia: koszyk → zamówienie → płatność → rezerwacja")
class OrderFlowIntegrationTest {

    @Autowired private CartService cartService;
    @Autowired private OrderService orderService;
    @Autowired private OrderPaymentService orderPaymentService;
    @Autowired private ReservationService reservationService;
    @Autowired private PaymentService paymentService;
    @Autowired private TripRepository tripRepository;
    @Autowired private SeatAvailabilityService seatAvailabilityService;
    @Autowired private MutableClock clock;

    private Trip trip;

    @BeforeEach
    void createTrip() {
        trip = tripRepository.save(TripFixtures.trip("zamowienie-" + UUID.randomUUID(), 6));
    }

    private OrderDtos.PlacedOrderResponse placeOrder(int seats, String mode) {
        UUID cart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), seats, mode));
        return orderService.placeOrder(
                new OrderDtos.PlaceOrderRequest(
                        cart,
                        new OrderDtos.CustomerRequest(
                                "Anna", "Kowalska", "Anna@Example.TEST", "+48111222333", null),
                        true),
                null);
    }

    @Test
    @DisplayName("zamówienie zamraża ceny i zostawia miejsca zablokowane do czasu płatności")
    void placingOrderFreezesPricesAndKeepsHolds() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(2, "DEPOSIT");

        assertThat(placed.order().status()).isEqualTo(OrderStatus.PENDING_PAYMENT.name());
        assertThat(placed.order().amountDueNow()).isEqualByComparingTo("4000.00");
        assertThat(placed.order().tripTotal()).isEqualByComparingTo("20000.00");
        assertThat(placed.order().customer().email()).isEqualTo("anna@example.test");
        assertThat(placed.accessToken()).isNotBlank();
        assertThat(placed.reservationUrl()).contains(placed.order().orderNumber());

        // Miejsca wciąż nie są „sprzedane", ale też nie są dostępne dla innych.
        assertThat(trip.getBookedSeats()).isZero();
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(4);
    }

    @Test
    @DisplayName("dopiero opłacenie zamienia blokadę w miejsce zajęte")
    void paymentConvertsHoldsIntoSeats() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(2, "DEPOSIT");
        PaymentDtos.PaymentSessionResponse session =
                paymentService.startPayment(
                        new PaymentDtos.StartPaymentRequest(
                                placed.order().orderNumber(), placed.accessToken()));

        paymentService.confirm(session.paymentId());

        OrderDtos.ReservationResponse reservation =
                reservationService.getByToken(
                        placed.order().orderNumber(), placed.accessToken());
        assertThat(reservation.order().status()).isEqualTo(OrderStatus.CONFIRMED.name());
        assertThat(reservation.order().amountPaid()).isEqualByComparingTo("4000.00");
        assertThat(reservation.order().balanceDue()).isEqualByComparingTo("16000.00");
        assertThat(orderPaymentService.bookedSeats(trip.getSlug())).isEqualTo(2);
    }

    @Test
    @DisplayName("powtórzone potwierdzenie płatności nie zajmuje miejsc drugi raz")
    void repeatedConfirmationIsIdempotent() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(2, "DEPOSIT");
        PaymentDtos.PaymentSessionResponse session =
                paymentService.startPayment(
                        new PaymentDtos.StartPaymentRequest(
                                placed.order().orderNumber(), placed.accessToken()));

        paymentService.confirm(session.paymentId());
        paymentService.confirm(session.paymentId());

        assertThat(orderPaymentService.bookedSeats(trip.getSlug())).isEqualTo(2);
    }

    @Test
    @DisplayName("rezerwacja zawiera komplet szczegółów wyjazdu do pobrania")
    void reservationCarriesFullTripDetails() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(1, "FULL");

        OrderDtos.ReservationResponse reservation =
                reservationService.getByToken(
                        placed.order().orderNumber(), placed.accessToken());

        assertThat(reservation.trips()).hasSize(1);
        assertThat(reservation.trips().getFirst().itinerary()).isNotEmpty();
        assertThat(reservation.trips().getFirst().included()).isNotEmpty();
        assertThat(reservation.order().items().getFirst().balanceDue())
                .isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("zły token nie odsłania cudzej rezerwacji")
    void wrongTokenIsRejected() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(1, "DEPOSIT");

        assertThatThrownBy(
                        () ->
                                reservationService.getByToken(
                                        placed.order().orderNumber(), "nie-ten-token"))
                .isInstanceOf(pl.czulapodroz.api.common.error.NotFoundException.class);
    }

    @Test
    @DisplayName("koszyka zamienionego w zamówienie nie da się użyć drugi raz")
    void cartCannotBeOrderedTwice() {
        UUID cart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), 1, "DEPOSIT"));
        OrderDtos.PlaceOrderRequest request =
                new OrderDtos.PlaceOrderRequest(
                        cart,
                        new OrderDtos.CustomerRequest(
                                "Anna", "Kowalska", "anna@example.test", null, null),
                        true);
        orderService.placeOrder(request, null);

        assertThatThrownBy(() -> orderService.placeOrder(request, null))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("nie da się złożyć zamówienia z pustego koszyka")
    void emptyCartCannotBeOrdered() {
        UUID cart = UUID.fromString(cartService.createCart(null).id());

        assertThatThrownBy(
                        () ->
                                orderService.placeOrder(
                                        new OrderDtos.PlaceOrderRequest(
                                                cart,
                                                new OrderDtos.CustomerRequest(
                                                        "Anna",
                                                        "Kowalska",
                                                        "anna@example.test",
                                                        null,
                                                        null),
                                                true),
                                        null))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("jeśli miejsca zniknęły w trakcie wypełniania formularza, zamówienie nie powstaje")
    void orderFailsWhenSeatsRanOutMeanwhile() {
        UUID slowCart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(slowCart, new CartDtos.AddItemRequest(trip.getSlug(), 4, "DEPOSIT"));

        // Blokada wygasa, a miejsca w międzyczasie zajmuje ktoś inny.
        clock.advance(Duration.ofMinutes(21));
        UUID fastCart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(fastCart, new CartDtos.AddItemRequest(trip.getSlug(), 4, "DEPOSIT"));

        assertThatThrownBy(
                        () ->
                                orderService.placeOrder(
                                        new OrderDtos.PlaceOrderRequest(
                                                slowCart,
                                                new OrderDtos.CustomerRequest(
                                                        "Anna",
                                                        "Kowalska",
                                                        "anna@example.test",
                                                        null,
                                                        null),
                                                true),
                                        null))
                .isInstanceOf(SeatsUnavailableException.class);
    }

    @Test
    @DisplayName("po terminie płatności zamówienie wygasa, a miejsca wracają do puli")
    void unpaidOrderExpiresAndFreesSeats() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(3, "DEPOSIT");
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(3);

        clock.advance(Duration.ofMinutes(61));
        int expired = orderPaymentService.expireUnpaidOrders();

        assertThat(expired).isEqualTo(1);
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(6);
        assertThat(orderService.requireByNumber(placed.order().orderNumber()).getStatus())
                .isEqualTo(OrderStatus.EXPIRED);
    }

    @Test
    @DisplayName("przeterminowanego zamówienia nie da się opłacić")
    void expiredOrderCannotBePaid() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(1, "DEPOSIT");
        clock.advance(Duration.ofMinutes(61));

        assertThatThrownBy(
                        () ->
                                paymentService.startPayment(
                                        new PaymentDtos.StartPaymentRequest(
                                                placed.order().orderNumber(),
                                                placed.accessToken())))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("ponowne kliknięcie „Zapłać” nie tworzy drugiej transakcji")
    void startingPaymentTwiceReusesSession() {
        OrderDtos.PlacedOrderResponse placed = placeOrder(1, "DEPOSIT");
        PaymentDtos.StartPaymentRequest request =
                new PaymentDtos.StartPaymentRequest(
                        placed.order().orderNumber(), placed.accessToken());

        PaymentDtos.PaymentSessionResponse first = paymentService.startPayment(request);
        PaymentDtos.PaymentSessionResponse second = paymentService.startPayment(request);

        assertThat(second.paymentId()).isEqualTo(first.paymentId());
    }
}
