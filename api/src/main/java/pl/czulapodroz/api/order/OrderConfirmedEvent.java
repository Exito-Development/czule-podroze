package pl.czulapodroz.api.order;

import java.util.UUID;

/**
 * Zamówienie zostało opłacone i miejsca są przyznane na stałe.
 *
 * Zdarzenie pozwala innym modułom (np. liście uczestniczek) zareagować, nie
 * wiążąc ich z modułem zamówień w drugą stronę. Nasłuch działa w tej samej
 * transakcji, więc albo wszystko się uda, albo nic.
 *
 * @param orderId     identyfikator zamówienia
 * @param orderNumber numer widoczny dla klientki
 */
public record OrderConfirmedEvent(UUID orderId, String orderNumber) {}
