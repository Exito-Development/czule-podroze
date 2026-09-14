package pl.czulapodroz.api.messaging;

/**
 * Port kanału wysyłki wiadomości.
 *
 * Reszta modułu nie wie, czy wiadomość idzie SMTP-em, przez zewnętrznego
 * dostawcę, czy tylko do logu — zna wyłącznie ten interfejs. Zmiana kanału
 * to nowa implementacja i jedna właściwość w konfiguracji.
 */
public interface MessageSender {

    /** Nazwa zapisywana przy wiadomości, np. `log`, `smtp`. */
    String providerName();

    /**
     * Wysyła jedną wiadomość.
     *
     * @throws MessageDeliveryException gdy doręczenie się nie powiodło — powód
     *     trafia do historii wysyłek, żeby dało się sprawdzić, kto nie dostał
     *     informacji
     */
    void send(OutgoingMessage message);

    /**
     * @param toName  nazwa odbiorczyni (może być pusta)
     * @param toEmail adres odbiorczyni
     */
    record OutgoingMessage(String toName, String toEmail, String subject, String body) {}

    /** Doręczenie nie powiodło się. */
    class MessageDeliveryException extends RuntimeException {
        public MessageDeliveryException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
