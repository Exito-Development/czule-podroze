package pl.czulapodroz.api.catalog;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Ustawienia prezentacji katalogu.
 *
 * @param fewLeftThreshold przy ilu wolnych miejscach pokazujemy „ostatnie miejsca"
 */
@ConfigurationProperties(prefix = "czula.catalog")
public record CatalogProperties(Integer fewLeftThreshold) {

    public CatalogProperties {
        fewLeftThreshold = fewLeftThreshold == null ? 3 : fewLeftThreshold;
    }
}
