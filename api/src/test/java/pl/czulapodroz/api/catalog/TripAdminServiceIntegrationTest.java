package pl.czulapodroz.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.web.dto.ItineraryUpdateRequest;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;
import pl.czulapodroz.api.catalog.web.dto.TripUpsertRequest;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.support.IntegrationTest;

@IntegrationTest
@Transactional
@DisplayName("Zarządzanie ofertą z panelu")
class TripAdminServiceIntegrationTest {

    @Autowired private TripAdminService tripAdminService;

    private TripUpsertRequest request(String slug) {
        return new TripUpsertRequest(
                slug,
                "Maroko",
                "Pustynia i medyna",
                "Afryka",
                "Maroko",
                7,
                LocalDate.of(2027, 4, 1),
                LocalDate.of(2027, 4, 7),
                new BigDecimal("8900.00"),
                new BigDecimal("1500.00"),
                12,
                "https://example.test/cover.jpg",
                true,
                List.of("Warsztaty", "Noclegi"),
                List.of(
                        new TripUpsertRequest.DestinationRequest(
                                0, "Marrakesz", "Dni 1–3", "Medyna i souki", "https://example.test/1.jpg")),
                List.of(
                        new TripUpsertRequest.DayRequest(
                                1, "Powitanie", "Transfer i kolacja", List.of("relaks")),
                        new TripUpsertRequest.DayRequest(
                                2, "Warsztat", "Pierwsza sesja", List.of("warsztat"))));
    }

    @Test
    @DisplayName("tworzy wyjazd wraz z planem, destynacjami i listą „w cenie”")
    void createsCompleteTrip() {
        TripResponse created = tripAdminService.create(request("maroko-" + UUID.randomUUID()));

        assertThat(created.itinerary()).hasSize(2);
        assertThat(created.destinations()).hasSize(1);
        assertThat(created.included()).containsExactly("Warsztaty", "Noclegi");
        assertThat(created.continent()).isEqualTo("Afryka");
        assertThat(created.status()).isEqualTo("open");
    }

    @Test
    @DisplayName("zapis samych danych wyjazdu NIE kasuje planu dzień po dniu")
    void updatingDetailsKeepsItinerary() {
        String slug = "maroko-" + UUID.randomUUID();
        tripAdminService.create(request(slug));

        TripUpsertRequest detailsOnly =
                new TripUpsertRequest(
                        slug,
                        "Maroko zimą",
                        "Nowe hasło",
                        "Afryka",
                        "Maroko",
                        7,
                        LocalDate.of(2027, 4, 1),
                        LocalDate.of(2027, 4, 7),
                        new BigDecimal("9900.00"),
                        new BigDecimal("1500.00"),
                        12,
                        "https://example.test/cover.jpg",
                        true,
                        null,
                        null,
                        null);

        TripResponse updated = tripAdminService.update(slug, detailsOnly);

        assertThat(updated.title()).isEqualTo("Maroko zimą");
        assertThat(updated.price()).isEqualByComparingTo("9900.00");
        assertThat(updated.itinerary()).hasSize(2);
        assertThat(updated.destinations()).hasSize(1);
        assertThat(updated.included()).hasSize(2);
    }

    @Test
    @DisplayName("pusta lista czyści sekcję — w odróżnieniu od jej pominięcia")
    void emptyListClearsSection() {
        String slug = "maroko-" + UUID.randomUUID();
        tripAdminService.create(request(slug));

        TripUpsertRequest cleared =
                new TripUpsertRequest(
                        slug,
                        "Maroko",
                        "Pustynia i medyna",
                        "Afryka",
                        "Maroko",
                        7,
                        LocalDate.of(2027, 4, 1),
                        LocalDate.of(2027, 4, 7),
                        new BigDecimal("8900.00"),
                        new BigDecimal("1500.00"),
                        12,
                        "https://example.test/cover.jpg",
                        true,
                        List.of(),
                        null,
                        null);

        assertThat(tripAdminService.update(slug, cleared).included()).isEmpty();
    }

    @Test
    @DisplayName("podmienia sam plan dzień po dniu")
    void replacesItinerary() {
        String slug = "maroko-" + UUID.randomUUID();
        tripAdminService.create(request(slug));

        TripResponse updated =
                tripAdminService.replaceItinerary(
                        slug,
                        new ItineraryUpdateRequest(
                                List.of(
                                        new TripUpsertRequest.DayRequest(
                                                1, "Nowy dzień", "Opis", List.of()))));

        assertThat(updated.itinerary()).singleElement().satisfies(
                day -> assertThat(day.title()).isEqualTo("Nowy dzień"));
    }

    @Test
    @DisplayName("nie pozwala na dwa wyjazdy pod tym samym adresem")
    void rejectsDuplicateSlug() {
        String slug = "maroko-" + UUID.randomUUID();
        tripAdminService.create(request(slug));

        assertThatThrownBy(() -> tripAdminService.create(request(slug)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("odrzuca zadatek wyższy niż cena i odwróconą datę")
    void validatesMoneyAndDates() {
        String slug = "maroko-" + UUID.randomUUID();
        TripUpsertRequest base = request(slug);

        TripUpsertRequest badDeposit =
                new TripUpsertRequest(
                        slug, base.title(), base.tagline(), base.continent(), base.country(),
                        base.durationDays(), base.startDate(), base.endDate(),
                        new BigDecimal("1000.00"), new BigDecimal("5000.00"),
                        base.capacity(), base.coverImage(), true, null, null, null);
        assertThatThrownBy(() -> tripAdminService.create(badDeposit))
                .isInstanceOf(BadRequestException.class);

        TripUpsertRequest badDates =
                new TripUpsertRequest(
                        slug, base.title(), base.tagline(), base.continent(), base.country(),
                        base.durationDays(), LocalDate.of(2027, 4, 10), LocalDate.of(2027, 4, 1),
                        base.price(), base.deposit(), base.capacity(), base.coverImage(),
                        true, null, null, null);
        assertThatThrownBy(() -> tripAdminService.create(badDates))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("odrzuca powtórzone numery dni w planie")
    void rejectsDuplicateDayNumbers() {
        String slug = "maroko-" + UUID.randomUUID();
        tripAdminService.create(request(slug));

        assertThatThrownBy(
                        () ->
                                tripAdminService.replaceItinerary(
                                        slug,
                                        new ItineraryUpdateRequest(
                                                List.of(
                                                        new TripUpsertRequest.DayRequest(
                                                                1, "A", "Opis", List.of()),
                                                        new TripUpsertRequest.DayRequest(
                                                                1, "B", "Opis", List.of())))))
                .isInstanceOf(BadRequestException.class);
    }
}
