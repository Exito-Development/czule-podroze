package pl.czulapodroz.api.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.cart.CartService;
import pl.czulapodroz.api.cart.web.dto.CartDtos;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.messaging.web.dto.MessageDtos;
import pl.czulapodroz.api.order.OrderPaymentService;
import pl.czulapodroz.api.order.OrderService;
import pl.czulapodroz.api.order.web.dto.OrderDtos;
import pl.czulapodroz.api.participants.ParticipantService;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.TripFixtures;
import pl.czulapodroz.api.waitlist.WaitlistService;
import pl.czulapodroz.api.waitlist.web.dto.WaitlistDtos;

@IntegrationTest
@Import(MessagingServiceIntegrationTest.RecordingSenderConfig.class)
@Transactional
@DisplayName("Wiadomości do uczestniczek")
class MessagingServiceIntegrationTest {

    /** Zapamiętuje wysyłki zamiast je realizować — pozwala sprawdzić treść i odbiorczynie. */
    static class RecordingSender implements MessageSender {
        final List<OutgoingMessage> sent = new ArrayList<>();
        String failForEmail;

        @Override
        public String providerName() {
            return "test";
        }

        @Override
        public void send(OutgoingMessage message) {
            if (message.toEmail().equals(failForEmail)) {
                throw new MessageDeliveryException("Skrzynka nie istnieje", null);
            }
            sent.add(message);
        }
    }

    @TestConfiguration
    static class RecordingSenderConfig {
        @Bean
        @Primary
        RecordingSender recordingSender() {
            return new RecordingSender();
        }
    }

    @Autowired private MessagingService messagingService;
    @Autowired private ParticipantService participantService;
    @Autowired private CartService cartService;
    @Autowired private OrderService orderService;
    @Autowired private OrderPaymentService orderPaymentService;
    @Autowired private WaitlistService waitlistService;
    @Autowired private TripRepository tripRepository;
    @Autowired private RecordingSender sender;

    private Trip trip;

    @BeforeEach
    void createTrip() {
        trip = tripRepository.save(TripFixtures.trip("wiadomosci-" + UUID.randomUUID(), 10));
        sender.sent.clear();
        sender.failForEmail = null;
    }

    private String payFor(int seats, String firstName, String email) {
        UUID cart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), seats, "DEPOSIT"));
        OrderDtos.PlacedOrderResponse placed =
                orderService.placeOrder(
                        new OrderDtos.PlaceOrderRequest(
                                cart,
                                new OrderDtos.CustomerRequest(
                                        firstName, "Kowalska", email, null, null),
                                true),
                        null);
        orderPaymentService.recordOfflinePayment(placed.order().orderNumber(), null);
        participantService.roster(trip.getSlug());
        return placed.order().orderNumber();
    }

    @Test
    @DisplayName("trafia do wszystkich potwierdzonych uczestniczek z adresem e-mail")
    void sendsToParticipants() {
        payFor(1, "Anna", "anna@example.test");
        payFor(1, "Basia", "basia@example.test");

        MessageDtos.MessageResponse response =
                messagingService.send(
                        trip.getSlug(),
                        new MessageDtos.SendMessageRequest(
                                "PARTICIPANTS", "Zbiórka", "Do zobaczenia!"),
                        "admin@czulapodroz.pl");

        assertThat(response.recipientCount()).isEqualTo(2);
        assertThat(response.failedCount()).isZero();
        assertThat(sender.sent)
                .extracting(MessageSender.OutgoingMessage::toEmail)
                .containsExactlyInAnyOrder("anna@example.test", "basia@example.test");
    }

    @Test
    @DisplayName("podstawia imię, nazwę wyjazdu i kwotę do dopłaty")
    void personalizesBody() {
        payFor(1, "Anna", "anna@example.test");

        messagingService.send(
                trip.getSlug(),
                new MessageDtos.SendMessageRequest(
                        "PARTICIPANTS",
                        "Dopłata",
                        "Cześć {{imie}}! Wyjazd {{wyjazd}}, do dopłaty {{do_doplaty}}."),
                "admin@czulapodroz.pl");

        // Kwotę formatujemy po polsku („8 000 zł" — ze spacją nierozdzielającą),
        // więc sprawdzamy walutę i brak nieprzetworzonych podstawień, a nie
        // dokładny zapis separatora, który zależy od wersji CLDR w JDK.
        assertThat(sender.sent.getFirst().body())
                .contains("Cześć Anna!")
                .contains(trip.getTitle())
                .contains("zł")
                .doesNotContain("{{");
    }

    @Test
    @DisplayName("jedna osoba z dwiema rezerwacjami dostaje wiadomość raz")
    void deduplicatesByEmail() {
        payFor(1, "Anna", "anna@example.test");
        payFor(1, "Anna", "anna@example.test");

        MessageDtos.MessageResponse response =
                messagingService.send(
                        trip.getSlug(),
                        new MessageDtos.SendMessageRequest("PARTICIPANTS", "Temat", "Treść"),
                        "admin@czulapodroz.pl");

        assertThat(response.recipientCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("błąd jednego adresu nie przerywa wysyłki do pozostałych")
    void oneFailureDoesNotStopTheRest() {
        payFor(1, "Anna", "anna@example.test");
        payFor(1, "Basia", "basia@example.test");
        sender.failForEmail = "anna@example.test";

        MessageDtos.MessageResponse response =
                messagingService.send(
                        trip.getSlug(),
                        new MessageDtos.SendMessageRequest("PARTICIPANTS", "Temat", "Treść"),
                        "admin@czulapodroz.pl");

        assertThat(response.recipientCount()).isEqualTo(2);
        assertThat(response.failedCount()).isEqualTo(1);
        assertThat(response.deliveries())
                .filteredOn(d -> d.status().equals("FAILED"))
                .singleElement()
                .satisfies(
                        d -> {
                            assertThat(d.recipientEmail()).isEqualTo("anna@example.test");
                            assertThat(d.failureReason()).contains("Skrzynka nie istnieje");
                        });
        assertThat(sender.sent).hasSize(1);
    }

    @Test
    @DisplayName("grupa „zalegające z dopłatą” pomija opłacone w całości")
    void balanceDueSkipsFullyPaid() {
        payFor(1, "Anna", "anna@example.test");

        assertThat(messagingService.preview(trip.getSlug(), "BALANCE_DUE").count()).isEqualTo(1);

        UUID cart = UUID.fromString(cartService.createCart(null).id());
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), 1, "FULL"));
        OrderDtos.PlacedOrderResponse full =
                orderService.placeOrder(
                        new OrderDtos.PlaceOrderRequest(
                                cart,
                                new OrderDtos.CustomerRequest(
                                        "Celina", "Nowak", "celina@example.test", null, null),
                                true),
                        null);
        orderPaymentService.recordOfflinePayment(full.order().orderNumber(), null);
        participantService.roster(trip.getSlug());

        assertThat(messagingService.preview(trip.getSlug(), "PARTICIPANTS").count()).isEqualTo(2);
        assertThat(messagingService.preview(trip.getSlug(), "BALANCE_DUE").count()).isEqualTo(1);
    }

    @Test
    @DisplayName("obsługuje też listę rezerwową")
    void sendsToWaitlist() {
        waitlistService.join(
                new WaitlistDtos.JoinRequest(
                        trip.getSlug(), "Ola Rezerwowa", "ola@example.test", null));

        MessageDtos.MessageResponse response =
                messagingService.send(
                        trip.getSlug(),
                        new MessageDtos.SendMessageRequest(
                                "WAITLIST", "Zwolniło się miejsce", "Cześć {{imie}}!"),
                        "admin@czulapodroz.pl");

        assertThat(response.recipientCount()).isEqualTo(1);
        assertThat(sender.sent.getFirst().body()).contains("Cześć Ola!");
    }

    @Test
    @DisplayName("nie wysyła w pustkę")
    void refusesEmptyAudience() {
        assertThatThrownBy(
                        () ->
                                messagingService.send(
                                        trip.getSlug(),
                                        new MessageDtos.SendMessageRequest(
                                                "PARTICIPANTS", "Temat", "Treść"),
                                        "admin@czulapodroz.pl"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("nie ma nikogo");
    }

    @Test
    @DisplayName("historia zachowuje wynik każdego doręczenia")
    void keepsHistory() {
        payFor(1, "Anna", "anna@example.test");
        MessageDtos.MessageResponse sent =
                messagingService.send(
                        trip.getSlug(),
                        new MessageDtos.SendMessageRequest("PARTICIPANTS", "Temat", "Treść"),
                        "admin@czulapodroz.pl");

        assertThat(messagingService.history(trip.getSlug())).hasSize(1);
        assertThat(messagingService.detail(UUID.fromString(sent.id())).deliveries()).hasSize(1);
    }
}
