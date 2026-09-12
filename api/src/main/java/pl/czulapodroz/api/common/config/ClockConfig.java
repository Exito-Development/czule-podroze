package pl.czulapodroz.api.common.config;

import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Zegar jako zależność, nie statyczne `Instant.now()`.
 *
 * Dzięki temu testy blokad miejsc i tokenów mogą „przesuwać czas" bez
 * czekania i bez uśpień.
 */
@Configuration
public class ClockConfig {

    @Bean
    @ConditionalOnMissingBean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
