package pl.czulapodroz.api.support;

import java.time.Instant;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/**
 * Podstawia sterowalny zegar w miejsce systemowego.
 *
 * `MutableClock` jest `Clock`-iem, więc jeden bean oznaczony jako `@Primary`
 * obsługuje oba typy wstrzyknięć — osobny bean typu `Clock` tworzyłby drugiego
 * kandydata i psuł rozstrzyganie zależności.
 */
@TestConfiguration
public class TestClockConfig {

    public static final Instant FIXED_START = Instant.parse("2026-06-01T10:00:00Z");

    @Bean
    @Primary
    public MutableClock clock() {
        return new MutableClock(FIXED_START);
    }
}
