package pl.czulapodroz.api.inventory;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Parametry rezerwacji miejsc.
 *
 * @param holdDuration  jak długo koszyk trzyma miejsce bez zamówienia
 * @param paymentWindow ile czasu na opłacenie złożonego zamówienia
 * @param maxSeatsPerItem górny limit miejsc w jednej pozycji koszyka
 */
@ConfigurationProperties(prefix = "czula.booking")
public record BookingProperties(
        Duration holdDuration, Duration paymentWindow, Integer maxSeatsPerItem) {

    public BookingProperties {
        holdDuration = holdDuration == null ? Duration.ofMinutes(20) : holdDuration;
        paymentWindow = paymentWindow == null ? Duration.ofMinutes(60) : paymentWindow;
        maxSeatsPerItem = maxSeatsPerItem == null ? 4 : maxSeatsPerItem;
    }
}
