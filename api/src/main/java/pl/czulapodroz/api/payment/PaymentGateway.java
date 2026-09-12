package pl.czulapodroz.api.payment;

import java.math.BigDecimal;

/**
 * Port do operatora płatności.
 *
 * Reszta systemu nie wie, czy pieniądze przechodzą przez Przelewy24, Stripe,
 * czy przez atrapę w środowisku lokalnym — zna tylko ten interfejs. Podmiana
 * operatora to dodanie nowej implementacji i zmiana jednej właściwości.
 */
public interface PaymentGateway {

    /** Nazwa zapisywana przy płatności, np. `mock`, `przelewy24`. */
    String providerName();

    /** Zakłada sesję płatności i zwraca adres, pod który przekierowujemy klientkę. */
    PaymentSession createSession(PaymentSessionRequest request);

    /**
     * @param orderNumber    numer zamówienia widoczny dla klientki
     * @param amount         kwota do zapłaty teraz
     * @param currency       waluta ISO, np. `PLN`
     * @param customerEmail  e-mail płacącej
     * @param description    tytuł płatności
     * @param returnUrl      adres, na który operator ma wrócić po zakończeniu
     */
    record PaymentSessionRequest(
            String orderNumber,
            BigDecimal amount,
            String currency,
            String customerEmail,
            String description,
            String returnUrl) {}

    /**
     * @param externalId  identyfikator transakcji u operatora
     * @param redirectUrl adres strony płatności
     */
    record PaymentSession(String externalId, String redirectUrl) {}
}
