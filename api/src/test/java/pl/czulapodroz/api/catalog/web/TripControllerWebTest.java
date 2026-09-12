package pl.czulapodroz.api.catalog.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripRepository;
import pl.czulapodroz.api.support.IntegrationTest;
import pl.czulapodroz.api.support.TripFixtures;

@IntegrationTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Publiczne API katalogu")
class TripControllerWebTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private TripRepository tripRepository;

    @BeforeEach
    void seedTrip() {
        if (!tripRepository.existsBySlug("web-test-trip")) {
            tripRepository.save(TripFixtures.trip("web-test-trip", 8));
        }
    }

    @Test
    @DisplayName("lista wyjazdów jest publiczna i ma kształt oczekiwany przez frontend")
    void listsTripsPublicly() throws Exception {
        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.slug=='web-test-trip')]").exists())
                .andExpect(jsonPath("$[?(@.slug=='web-test-trip')].continent").value("Azja"))
                .andExpect(jsonPath("$[?(@.slug=='web-test-trip')].status").value("open"))
                .andExpect(
                        jsonPath("$[?(@.slug=='web-test-trip')].availability.available").value(8));
    }

    @Test
    @DisplayName("szczegóły wyjazdu zawierają plan dzień po dniu")
    void returnsItinerary() throws Exception {
        mockMvc.perform(get("/api/v1/trips/web-test-trip"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itinerary.length()").value(2))
                .andExpect(jsonPath("$.itinerary[0].day").value(1))
                .andExpect(jsonPath("$.itinerary[0].tags[0]").value("relaks"));
    }

    @Test
    @DisplayName("nieznany wyjazd to 404 z czytelnym kodem błędu")
    void unknownTripReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/trips/nie-ma-takiego"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("trip.notFound"));
    }

    @Test
    @DisplayName("nieznany kontynent kończy się czytelnym 400, nie wyjątkiem 500")
    void unknownContinentReturns400() throws Exception {
        mockMvc.perform(get("/api/v1/trips").param("continent", "Ameryka"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("continent.unknown"));
    }

    @Test
    @DisplayName("lista kontynentów nie zawiera już Ameryki")
    void listsSupportedContinents() throws Exception {
        mockMvc.perform(get("/api/v1/continents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.contains("Azja", "Afryka", "Europa")));
    }

    @Test
    @DisplayName("panel administracyjny jest zamknięty dla niezalogowanych")
    void adminRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/admin/trips")).andExpect(status().isUnauthorized());
    }
}
