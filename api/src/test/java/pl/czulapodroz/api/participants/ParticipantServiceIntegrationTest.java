package pl.czulapodroz.api.participants;

import static org.assertj.core.api.Assertions.assertThat;

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
import pl.czulapodroz.api.order.OrderPaymentService;
import pl.czulapodroz.api.order.OrderService;
import pl.czulapodroz.api.order.web.dto.OrderDtos;
import pl.czulapodroz.api.participants.web.dto.ParticipantDtos;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.TripFixtures;

@IntegrationTest
@Transactional
@DisplayName("Lista uczestniczek wyjazdu")
class ParticipantServiceIntegrationTest {

    @Autowired private CartService cartService;
    @Autowired private OrderService orderService;
    @Autowired private OrderPaymentService orderPaymentService;
    @Autowired private ParticipantService participantService;
    @Autowired private TripRepository tripRepository;

    private Trip trip;

    @BeforeEach
    void createTrip() {
        trip = tripRepository.save(TripFixtures.trip("lista-" + UUID.randomUUID(), 10));
    }

    private OrderDtos.PlacedOrderResponse orderFor(int seats, String email) {
        UUID cart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), seats, "DEPOSIT"));
        return orderService.placeOrder(
                new OrderDtos.PlaceOrderRequest(
                        cart,
                        new OrderDtos.CustomerRequest(
                                "Anna", "Kowalska", email, "+48111222333", "wegetarianka"),
                        true),
                null);
    }

    @Test
    @DisplayName("nie powstaje, dopóki zamówienie nie jest opłacone")
    void unpaidOrderHasNoParticipants() {
        orderFor(2, "anna@example.test");

        assertThat(participantService.roster(trip.getSlug()).participants()).isEmpty();
    }

    @Test
    @DisplayName("po opłaceniu tworzy po jednym wierszu na każde kupione miejsce")
    void createsOneRowPerSeat() {
        OrderDtos.PlacedOrderResponse placed = orderFor(3, "anna@example.test");
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);

        ParticipantDtos.RosterResponse roster = participantService.roster(trip.getSlug());

        assertThat(roster.participants()).hasSize(3);
        assertThat(roster.seatsSold()).isEqualTo(3);
    }

    @Test
    @DisplayName("pierwsze miejsce dostaje dane osoby rezerwującej, reszta czeka na uzupełnienie")
    void firstSeatBelongsToBooker() {
        OrderDtos.PlacedOrderResponse placed = orderFor(3, "anna@example.test");
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);

        ParticipantDtos.RosterResponse roster = participantService.roster(trip.getSlug());
        ParticipantDtos.ParticipantResponse booker = roster.participants().getFirst();

        assertThat(booker.contactPerson()).isTrue();
        assertThat(booker.email()).isEqualTo("anna@example.test");
        assertThat(booker.note()).isEqualTo("wegetarianka");
        assertThat(booker.incomplete()).isFalse();

        assertThat(roster.participants().subList(1, 3))
                .allSatisfy(
                        seat -> {
                            assertThat(seat.incomplete()).isTrue();
                            assertThat(seat.displayName()).contains("do uzupełnienia");
                        });
        assertThat(roster.incomplete()).isEqualTo(2);
    }

    @Test
    @DisplayName("ponowne wywołanie nie duplikuje wierszy")
    void rosterIsIdempotent() {
        OrderDtos.PlacedOrderResponse placed = orderFor(2, "anna@example.test");
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);

        participantService.roster(trip.getSlug());
        participantService.roster(trip.getSlug());

        assertThat(participantService.roster(trip.getSlug()).participants()).hasSize(2);
    }

    @Test
    @DisplayName("uzupełnione dane trafiają na listę i do wysyłek")
    void updatesParticipantDetails() {
        OrderDtos.PlacedOrderResponse placed = orderFor(2, "anna@example.test");
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);
        ParticipantDtos.RosterResponse roster = participantService.roster(trip.getSlug());
        UUID emptySeat =
                UUID.fromString(
                        roster.participants().stream()
                                .filter(ParticipantDtos.ParticipantResponse::incomplete)
                                .findFirst()
                                .orElseThrow()
                                .id());

        ParticipantDtos.ParticipantResponse updated =
                participantService.update(
                        emptySeat,
                        new ParticipantDtos.UpdateParticipantRequest(
                                "Basia", "Nowak", "BASIA@Example.TEST", "+48999888777", "bez laktozy"));

        assertThat(updated.displayName()).isEqualTo("Basia Nowak");
        assertThat(updated.email()).isEqualTo("basia@example.test");
        assertThat(updated.incomplete()).isFalse();
        assertThat(participantService.confirmedWithEmail(trip.getId())).hasSize(2);
    }

    @Test
    @DisplayName("rezygnacja zostaje w historii, ale znika z wysyłek")
    void cancelledParticipantIsNotMessaged() {
        OrderDtos.PlacedOrderResponse placed = orderFor(1, "anna@example.test");
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);
        UUID participantId =
                UUID.fromString(
                        participantService.roster(trip.getSlug()).participants().getFirst().id());

        participantService.cancel(participantId);

        assertThat(participantService.roster(trip.getSlug()).participants()).hasSize(1);
        assertThat(participantService.confirmedWithEmail(trip.getId())).isEmpty();
    }

    @Test
    @DisplayName("eksport CSV zawiera nagłówek i wiersz na każde miejsce")
    void exportsCsv() {
        OrderDtos.PlacedOrderResponse placed = orderFor(2, "anna@example.test");
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);

        String csv = participantService.csv(trip.getSlug());

        assertThat(csv.lines()).hasSize(3);
        assertThat(csv).startsWith("Imię,Nazwisko,E-mail");
        assertThat(csv).contains("\"anna@example.test\"");
    }
}
