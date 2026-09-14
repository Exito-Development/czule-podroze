package pl.czulapodroz.api.inventory.domain;

/** Cykl życia blokady miejsc. */
public enum SeatHoldStatus {
    /** Miejsca są zarezerwowane dla koszyka i niedostępne dla innych. */
    ACTIVE,
    /** Klientka usunęła wyjazd z koszyka — miejsca wróciły do puli. */
    RELEASED,
    /** Czas blokady minął bez złożenia zamówienia. */
    EXPIRED,
    /** Płatność potwierdzona — miejsca policzone na stałe przy wyjeździe. */
    CONVERTED
}
