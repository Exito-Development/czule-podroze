package pl.czulapodroz.api.payment.domain;

/** Stan pojedynczej próby płatności. */
public enum PaymentStatus {
    /** Sesja utworzona u operatora, czekamy na wynik. */
    PENDING,
    /** Operator potwierdził wpłatę. */
    SUCCEEDED,
    /** Płatność odrzucona. */
    FAILED,
    /** Klientka zrezygnowała na stronie operatora. */
    CANCELLED
}
