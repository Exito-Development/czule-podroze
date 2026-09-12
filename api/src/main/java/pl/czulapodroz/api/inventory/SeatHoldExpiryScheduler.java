package pl.czulapodroz.api.inventory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Sprząta wygasłe blokady miejsc.
 *
 * Zapytania o dostępność i tak pomijają blokady po terminie, więc zadanie nie
 * jest krytyczne dla poprawności — dba tylko o to, żeby tabela nie puchła
 * i żeby raporty pokazywały prawdziwe statusy.
 */
@Component
public class SeatHoldExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(SeatHoldExpiryScheduler.class);

    private final SeatAvailabilityService seatAvailabilityService;

    public SeatHoldExpiryScheduler(SeatAvailabilityService seatAvailabilityService) {
        this.seatAvailabilityService = seatAvailabilityService;
    }

    @Scheduled(fixedDelayString = "${czula.booking.expiry-scan-interval:PT1M}")
    public void expireOutdatedHolds() {
        int expired = seatAvailabilityService.expireOutdatedHolds();
        if (expired > 0) {
            log.info("Wygaszono {} blokad miejsc po terminie", expired);
        }
    }
}
