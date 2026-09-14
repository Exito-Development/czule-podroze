package pl.czulapodroz.api.catalog.domain;

/**
 * Status sprzedaży wyjazdu widoczny dla klientki.
 *
 * Status nie jest przechowywany w bazie — wynika z liczby wolnych miejsc
 * i flagi publikacji, więc nie da się go „rozjechać" z rzeczywistością.
 */
public enum TripStatus {
    /** Są wolne miejsca. */
    OPEN,
    /** Zostało już niewiele miejsc — warto się pospieszyć. */
    FEW_LEFT,
    /** Brak miejsc; zostaje lista rezerwowa. */
    SOLDOUT,
    /** Wyjazd zapowiedziany, sprzedaż jeszcze nie ruszyła. */
    UPCOMING;

    /** Nazwa używana przez frontend (kebab-case, jak w `lib/data/trips.ts`). */
    public String apiValue() {
        return name().toLowerCase().replace('_', '-');
    }
}
