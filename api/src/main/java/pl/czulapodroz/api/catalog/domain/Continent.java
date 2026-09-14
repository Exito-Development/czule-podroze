package pl.czulapodroz.api.catalog.domain;

/**
 * Kontynenty, po których filtrujemy ofertę.
 *
 * Ameryki nie ma na liście świadomie — nie mamy tam wyjazdów, a pusta
 * kategoria w UI wygląda jak błąd. Dodanie wartości tutaj wystarczy, żeby
 * kategoria pojawiła się w API (i w filtrze na stronie).
 */
public enum Continent {
    ASIA("Azja"),
    AFRICA("Afryka"),
    EUROPE("Europa");

    private final String polishName;

    Continent(String polishName) {
        this.polishName = polishName;
    }

    /** Nazwa prezentowana w UI. */
    public String polishName() {
        return polishName;
    }

    /**
     * Rozpoznaje kontynent po nazwie polskiej („Azja") albo po nazwie stałej
     * („ASIA"). Dzięki temu frontend może przekazywać wartość prosto z filtra.
     */
    public static Continent fromApiValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        for (Continent continent : values()) {
            if (continent.name().equalsIgnoreCase(value)
                    || continent.polishName.equalsIgnoreCase(value)) {
                return continent;
            }
        }
        throw new IllegalArgumentException("Nieznany kontynent: " + value);
    }
}
