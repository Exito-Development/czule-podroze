package pl.czulapodroz.api.support;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test integracyjny: pełny kontekst aplikacji, baza H2 z tymi samymi
 * migracjami co produkcja i sterowalny zegar.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@ActiveProfiles("test")
@Import(TestClockConfig.class)
public @interface IntegrationTest {}
