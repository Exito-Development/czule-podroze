package pl.czulapodroz.api.order.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.PaymentMode;
import pl.czulapodroz.api.support.TripFixtures;

@DisplayName("Zamówienie")
class TripOrderTest {

    private static final Instant NOW = Instant.parse("2026-06-01T10:00:00Z");

    private TripOrder order() {
        return new TripOrder(
                "CP-2026-TEST01",
                UUID.randomUUID(),
                null,
                new Customer("Anna", "Kowalska", "anna@example.test", null, null),
                "hash",
                NOW.plusSeconds(3600));
    }

    @Test
    @DisplayName("sumuje kwoty pozycji: do zapłaty teraz i wartość całkowitą")
    void sumsItemAmounts() {
        TripOrder order = order();
        Trip trip = TripFixtures.trip("tajlandia", 10);

        order.addItem(new OrderItem(order, trip, 2, PaymentMode.DEPOSIT));

        assertThat(order.getAmountDueNow()).isEqualByComparingTo("4000.00");
        assertThat(order.getTripTotal()).isEqualByComparingTo("20000.00");
        assertThat(order.balanceDue()).isEqualByComparingTo("20000.00");
    }

    @Test
    @DisplayName("po wpłacie zadatku pokazuje, ile zostaje do dopłaty")
    void tracksBalanceAfterDeposit() {
        TripOrder order = order();
        order.addItem(new OrderItem(order, TripFixtures.trip("tajlandia", 10), 1, PaymentMode.DEPOSIT));

        assertThat(order.markPaid(new BigDecimal("2000.00"), NOW)).isTrue();

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(order.balanceDue()).isEqualByComparingTo("8000.00");
        assertThat(order.getPaidAt()).isEqualTo(NOW);
    }

    @Test
    @DisplayName("płatność całością zeruje pozostałą kwotę")
    void fullPaymentLeavesNothingToPay() {
        TripOrder order = order();
        order.addItem(new OrderItem(order, TripFixtures.trip("tajlandia", 10), 1, PaymentMode.FULL));
        order.markPaid(new BigDecimal("10000.00"), NOW);

        assertThat(order.balanceDue()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("powtórzone powiadomienie operatora nie księguje wpłaty dwa razy")
    void secondPaymentNotificationIsIgnored() {
        TripOrder order = order();
        order.addItem(new OrderItem(order, TripFixtures.trip("tajlandia", 10), 1, PaymentMode.DEPOSIT));
        order.markPaid(new BigDecimal("2000.00"), NOW);

        assertThat(order.markPaid(new BigDecimal("2000.00"), NOW.plusSeconds(5))).isFalse();
        assertThat(order.getAmountPaid()).isEqualByComparingTo("2000.00");
    }

    @Test
    @DisplayName("opłaconego zamówienia nie da się anulować automatem")
    void paidOrderCannotBeCancelled() {
        TripOrder order = order();
        order.addItem(new OrderItem(order, TripFixtures.trip("tajlandia", 10), 1, PaymentMode.DEPOSIT));
        order.markPaid(new BigDecimal("2000.00"), NOW);

        assertThatThrownBy(() -> order.cancel(NOW)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("wygaszenie działa tylko na zamówienia czekające na płatność")
    void expiresOnlyPendingOrders() {
        TripOrder pending = order();
        pending.expire(NOW);
        assertThat(pending.getStatus()).isEqualTo(OrderStatus.EXPIRED);

        TripOrder paid = order();
        paid.addItem(new OrderItem(paid, TripFixtures.trip("tajlandia", 10), 1, PaymentMode.DEPOSIT));
        paid.markPaid(new BigDecimal("2000.00"), NOW);
        paid.expire(NOW);
        assertThat(paid.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }
}
