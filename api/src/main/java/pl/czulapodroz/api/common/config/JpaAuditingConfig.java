package pl.czulapodroz.api.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** Włącza automatyczne wypełnianie `createdAt` / `updatedAt` w encjach. */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {}
