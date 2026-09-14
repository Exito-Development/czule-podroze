package pl.czulapodroz.api.common.domain;

import java.math.BigDecimal;

/** Sposób rozliczenia wyjazdu wybrany przez klientkę. */
public enum PaymentMode {

    /** Płatność zadatkiem — reszta kwoty przed wyjazdem. */
    DEPOSIT,

    /** Płatność całości z góry. */
    FULL;

    /** Kwota do zapłaty teraz za jedno miejsce. */
    public BigDecimal amountDuePerSeat(BigDecimal price, BigDecimal deposit) {
        return this == FULL ? price : deposit;
    }
}
