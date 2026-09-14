package pl.czulapodroz.api.inventory;

/**
 * Migawka dostępności miejsc na wyjeździe.
 *
 * @param capacity  pojemność wyjazdu
 * @param booked    miejsca opłacone
 * @param held      miejsca trzymane teraz w cudzych koszykach
 * @param available miejsca, które można jeszcze sprzedać
 */
public record SeatAvailability(int capacity, int booked, int held, int available) {

    public static SeatAvailability of(int capacity, int booked, int held) {
        return new SeatAvailability(
                capacity, booked, held, Math.max(0, capacity - booked - held));
    }

    public boolean soldOut() {
        return available == 0;
    }
}
