package pl.czulapodroz.api.common.config;

/** Kontrola wartości konfiguracyjnych, które muszą przyjść ze środowiska. */
public final class RequiredConfig {

    private RequiredConfig() {}

    /**
     * Odrzuca wartość, która została nierozwiązanym odwołaniem do zmiennej.
     *
     * <p>Zapis {@code ${ZMIENNA}} bez wartości zapasowej NIE zatrzymuje startu
     * aplikacji — Spring przy wiązaniu właściwości domyślnie zostawia wtedy
     * dosłowny tekst {@code "${ZMIENNA}"}. Bez tej kontroli produkcja ruszyłaby
     * z adresem rezerwacji w rodzaju
     * {@code ${FRONTEND_BASE_URL}/rezerwacja/ABC} wysyłanym klientkom.
     *
     * @throws IllegalStateException gdy wartość jest pusta albo nierozwiązana
     */
    public static String resolved(String value, String property) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    property + " musi być ustawione (brak wartości)");
        }
        if (value.contains("${")) {
            throw new IllegalStateException(
                    property + " zawiera nierozwiązaną zmienną środowiskową: " + value
                            + " — ustaw ją w środowisku uruchomieniowym");
        }
        return value;
    }
}
