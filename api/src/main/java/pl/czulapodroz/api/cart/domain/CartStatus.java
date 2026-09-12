package pl.czulapodroz.api.cart.domain;

/** Stan koszyka. */
public enum CartStatus {
    /** Klientka wciąż kompletuje wyjazdy. */
    ACTIVE,
    /** Koszyk zamieniony na zamówienie — nie można go już zmieniać. */
    ORDERED,
    /** Porzucony; blokady miejsc zwolnione. */
    ABANDONED
}
