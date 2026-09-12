package pl.czulapodroz.api.cart;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.cart.web.dto.CartDtos;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.inventory.SeatsUnavailableException;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.MutableClock;
import pl.czulapodroz.api.support.TripFixtures;

@IntegrationTest
@Transactional
@DisplayName("Koszyk z blokadą miejsc")
class CartServiceIntegrationTest {

    @Autowired private CartService cartService;
    @Autowired private TripRepository tripRepository;
    @Autowired private SeatAvailabilityService seatAvailabilityService;
    @Autowired private MutableClock clock;

    private Trip trip;

    @BeforeEach
    void createTrip() {
        trip = tripRepository.save(TripFixtures.trip("koszyk-" + UUID.randomUUID(), 4));
    }

    private UUID newCart() {
        return UUID.fromString(cartService.createCart(null).id());
    }

    @Test
    @DisplayName("dodanie wyjazdu zdejmuje miejsca z puli dostępnej dla innych")
    void addingItemHoldsSeats() {
        UUID cart = newCart();

        CartDtos.CartResponse response =
                cartService.addItem(
                        cart, new CartDtos.AddItemRequest(trip.getSlug(), 2, "DEPOSIT"));

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().holdActive()).isTrue();
        assertThat(response.totalDueNow()).isEqualByComparingTo("4000.00");
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(2);
    }

    @Test
    @DisplayName("drugi koszyk nie weźmie miejsc trzymanych przez pierwszy")
    void secondCartCannotTakeHeldSeats() {
        cartService.addItem(newCart(), new CartDtos.AddItemRequest(trip.getSlug(), 3, "DEPOSIT"));
        UUID other = newCart();

        assertThatThrownBy(
                        () ->
                                cartService.addItem(
                                        other,
                                        new CartDtos.AddItemRequest(trip.getSlug(), 2, "DEPOSIT")))
                .isInstanceOf(SeatsUnavailableException.class)
                .hasMessageContaining("1");
    }

    @Test
    @DisplayName("własna blokada nie blokuje zmiany liczby miejsc w tym samym koszyku")
    void ownHoldDoesNotBlockResize() {
        UUID cart = newCart();
        CartDtos.CartResponse added =
                cartService.addItem(
                        cart, new CartDtos.AddItemRequest(trip.getSlug(), 2, "DEPOSIT"));
        UUID itemId = UUID.fromString(added.items().getFirst().id());

        CartDtos.CartResponse updated =
                cartService.updateItem(cart, itemId, new CartDtos.UpdateItemRequest(4, "FULL"));

        assertThat(updated.items().getFirst().seats()).isEqualTo(4);
        assertThat(updated.totalDueNow()).isEqualByComparingTo("40000.00");
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isZero();
    }

    @Test
    @DisplayName("usunięcie pozycji natychmiast zwraca miejsca do puli")
    void removingItemReleasesSeats() {
        UUID cart = newCart();
        CartDtos.CartResponse added =
                cartService.addItem(
                        cart, new CartDtos.AddItemRequest(trip.getSlug(), 3, "DEPOSIT"));
        UUID itemId = UUID.fromString(added.items().getFirst().id());

        cartService.removeItem(cart, itemId);

        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(4);
    }

    @Test
    @DisplayName("po wygaśnięciu blokady miejsca wracają do puli")
    void expiredHoldFreesSeats() {
        cartService.addItem(newCart(), new CartDtos.AddItemRequest(trip.getSlug(), 4, "DEPOSIT"));
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isZero();

        clock.advance(Duration.ofMinutes(21));

        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(4);
    }

    @Test
    @DisplayName("koszyk pokazuje, że blokada wygasła, żeby klientka o tym wiedziała")
    void cartShowsExpiredHold() {
        UUID cart = newCart();
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), 2, "DEPOSIT"));

        clock.advance(Duration.ofMinutes(21));
        CartDtos.CartResponse response = cartService.getCart(cart);

        assertThat(response.items().getFirst().holdActive()).isFalse();
    }

    @Test
    @DisplayName("odświeżenie koszyka odnawia wygasłe blokady, gdy miejsca wciąż są")
    void refreshRenewsHolds() {
        UUID cart = newCart();
        cartService.addItem(cart, new CartDtos.AddItemRequest(trip.getSlug(), 2, "DEPOSIT"));
        clock.advance(Duration.ofMinutes(21));

        CartDtos.CartResponse refreshed = cartService.refreshHolds(cart);

        assertThat(refreshed.items().getFirst().holdActive()).isTrue();
        assertThat(seatAvailabilityService.availabilityFor(trip).available()).isEqualTo(2);
    }

    @Test
    @DisplayName("pilnuje limitu miejsc na jedną rezerwację")
    void enforcesMaxSeatsPerItem() {
        Trip big = tripRepository.save(TripFixtures.trip("duzy-" + UUID.randomUUID(), 20));
        UUID cart = newCart();

        assertThatThrownBy(
                        () ->
                                cartService.addItem(
                                        cart, new CartDtos.AddItemRequest(big.getSlug(), 5, "DEPOSIT")))
                .isInstanceOf(BadRequestException.class);
    }
}
