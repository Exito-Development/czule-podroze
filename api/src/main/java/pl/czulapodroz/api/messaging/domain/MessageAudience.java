package pl.czulapodroz.api.messaging.domain;

/**
 * Do kogo idzie wiadomość.
 *
 * Grupy są wyliczane w chwili wysyłki, a nie zapisywane na sztywno — lista
 * uczestniczek zmienia się do ostatniej chwili.
 */
public enum MessageAudience {
    /** Wszystkie potwierdzone uczestniczki wyjazdu. */
    PARTICIPANTS("Uczestniczki wyjazdu"),

    /** Te, które mają jeszcze coś do dopłaty przed wyjazdem. */
    BALANCE_DUE("Zalegające z dopłatą"),

    /** Osoby z zamówieniem czekającym na płatność. */
    PENDING_PAYMENT("Oczekujące na płatność"),

    /** Zapisane na listę rezerwową. */
    WAITLIST("Lista rezerwowa");

    private final String label;

    MessageAudience(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
