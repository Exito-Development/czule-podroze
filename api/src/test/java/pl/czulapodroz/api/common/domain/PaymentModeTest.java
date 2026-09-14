package pl.czulapodroz.api.common.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Sposób płatności")
class PaymentModeTest {

    private static final BigDecimal PRICE = new BigDecimal("9900.00");
    private static final BigDecimal DEPOSIT = new BigDecimal("1500.00");

    @Test
    @DisplayName("zadatek pobiera tylko kwotę zadatku")
    void depositChargesDeposit() {
        assertThat(PaymentMode.DEPOSIT.amountDuePerSeat(PRICE, DEPOSIT))
                .isEqualByComparingTo(DEPOSIT);
    }

    @Test
    @DisplayName("płatność całością pobiera pełną cenę")
    void fullChargesPrice() {
        assertThat(PaymentMode.FULL.amountDuePerSeat(PRICE, DEPOSIT)).isEqualByComparingTo(PRICE);
    }
}
