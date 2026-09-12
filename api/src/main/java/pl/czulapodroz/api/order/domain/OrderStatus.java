package pl.czulapodroz.api.order.domain;

/** Cykl życia zamówienia. */
public enum OrderStatus {
    /** Zamówienie złożone, czekamy na płatność — miejsca wciąż zablokowane. */
    PENDING_PAYMENT,
    /** Płatność zaksięgowana, miejsca przyznane na stałe. */
    CONFIRMED,
    /** Anulowane przez klientkę lub organizatorki. */
    CANCELLED,
    /** Minął czas na opłacenie — miejsca wróciły do puli. */
    EXPIRED
}
