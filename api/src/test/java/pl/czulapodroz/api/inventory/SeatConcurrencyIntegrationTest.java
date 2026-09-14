package pl.czulapodroz.api.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import pl.czulapodroz.api.cart.CartService;
import pl.czulapodroz.api.cart.web.dto.CartDtos;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.TripFixtures;

/**
 * Najważniejszy test tego modułu: równoległe koszyki nie mogą sprzedać
 * tego samego miejsca dwa razy.
 *
 * Świadomie BEZ `@Transactional` na teście — każdy wątek musi mieć własną
 * transakcję, inaczej nie sprawdzilibyśmy blokady wiersza, tylko logikę
 * w pamięci.
 */
@IntegrationTest
@DisplayName("Wyścig o ostatnie miejsca")
class SeatConcurrencyIntegrationTest {

    private static final int CAPACITY = 6;
    private static final int SEATS_PER_CART = 2;
    private static final int COMPETING_CARTS = 8;

    @Autowired private CartService cartService;
    @Autowired private TripRepository tripRepository;
    @Autowired private SeatAvailabilityService seatAvailabilityService;

    @Test
    @DisplayName("z ośmiu równoległych koszyków miejsca dostają dokładnie trzy")
    void concurrentCartsCannotOversell() throws Exception {
        Trip trip = tripRepository.save(TripFixtures.trip("wyscig-" + UUID.randomUUID(), CAPACITY));

        AtomicInteger succeeded = new AtomicInteger();
        AtomicInteger rejected = new AtomicInteger();
        CountDownLatch start = new CountDownLatch(1);

        try (ExecutorService pool = Executors.newFixedThreadPool(COMPETING_CARTS)) {
            List<Callable<Void>> attempts =
                    java.util.stream.IntStream.range(0, COMPETING_CARTS)
                            .<Callable<Void>>mapToObj(
                                    index ->
                                            () -> {
                                                UUID cart =
                                                        UUID.fromString(
                                                                cartService.createCart(null).id());
                                                start.await(5, TimeUnit.SECONDS);
                                                try {
                                                    cartService.addItem(
                                                            cart,
                                                            new CartDtos.AddItemRequest(
                                                                    trip.getSlug(),
                                                                    SEATS_PER_CART,
                                                                    "DEPOSIT"));
                                                    succeeded.incrementAndGet();
                                                } catch (SeatsUnavailableException expected) {
                                                    rejected.incrementAndGet();
                                                }
                                                return null;
                                            })
                            .toList();

            List<Future<Void>> futures = attempts.stream().map(pool::submit).toList();
            start.countDown();
            for (Future<Void> future : futures) {
                future.get(30, TimeUnit.SECONDS);
            }
        }

        int expectedWinners = CAPACITY / SEATS_PER_CART;
        assertThat(succeeded.get()).isEqualTo(expectedWinners);
        assertThat(rejected.get()).isEqualTo(COMPETING_CARTS - expectedWinners);

        Trip reloaded = tripRepository.findById(trip.getId()).orElseThrow();
        assertThat(seatAvailabilityService.availabilityFor(reloaded).available()).isZero();
        assertThat(seatAvailabilityService.availabilityFor(reloaded).held()).isEqualTo(CAPACITY);
    }
}
