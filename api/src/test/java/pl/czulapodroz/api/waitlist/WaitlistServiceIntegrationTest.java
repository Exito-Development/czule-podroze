package pl.czulapodroz.api.waitlist;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.TripFixtures;
import pl.czulapodroz.api.waitlist.web.dto.WaitlistDtos;

@IntegrationTest
@Transactional
@DisplayName("Lista rezerwowa")
class WaitlistServiceIntegrationTest {

    @Autowired private WaitlistService waitlistService;
    @Autowired private TripRepository tripRepository;

    private Trip trip;

    @BeforeEach
    void createTrip() {
        trip = tripRepository.save(TripFixtures.trip("lista-" + UUID.randomUUID(), 2));
    }

    @Test
    @DisplayName("zapisuje i podaje miejsce w kolejce")
    void addsEntryWithPosition() {
        WaitlistDtos.WaitlistEntryResponse first =
                waitlistService.join(
                        new WaitlistDtos.JoinRequest(
                                trip.getSlug(), "Anna", "anna@example.test", "+48111222333"));
        WaitlistDtos.WaitlistEntryResponse second =
                waitlistService.join(
                        new WaitlistDtos.JoinRequest(
                                trip.getSlug(), "Basia", "basia@example.test", null));

        assertThat(first.position()).isEqualTo(1);
        assertThat(second.position()).isEqualTo(2);
        assertThat(first.status()).isEqualTo("WAITING");
    }

    @Test
    @DisplayName("powtórne wysłanie formularza aktualizuje kontakt zamiast tworzyć duplikat")
    void repeatedSubmissionUpdatesContact() {
        waitlistService.join(
                new WaitlistDtos.JoinRequest(trip.getSlug(), "Anna", "Anna@Example.TEST", null));

        WaitlistDtos.WaitlistEntryResponse again =
                waitlistService.join(
                        new WaitlistDtos.JoinRequest(
                                trip.getSlug(), "Anna Kowalska", "anna@example.test", "+48999888777"));

        assertThat(waitlistService.listForTrip(trip.getSlug())).hasSize(1);
        assertThat(again.name()).isEqualTo("Anna Kowalska");
        assertThat(again.phone()).isEqualTo("+48999888777");
        assertThat(again.position()).isEqualTo(1);
    }
}
