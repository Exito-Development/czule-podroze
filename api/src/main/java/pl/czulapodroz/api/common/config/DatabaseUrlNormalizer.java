package pl.czulapodroz.api.common.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Tłumaczy adres bazy z postaci, którą dają platformy hostingowe, na postać JDBC.
 *
 * <p>Railway, Render, Heroku i Fly wystawiają jedną zmienną w formacie
 * {@code postgresql://użytkownik:hasło@host:5432/baza}. Spring wymaga
 * {@code jdbc:postgresql://host:5432/baza} oraz osobnych pól na login i hasło,
 * więc bez tego kroku trzeba składać adres ręcznie z kilku zmiennych — czyli
 * rozbijać jedno źródło prawdy na trzy.
 *
 * <p>Przetwarzanie dzieje się przed utworzeniem puli połączeń. Adres już podany
 * w postaci JDBC zostaje nietknięty, więc profil lokalny i testy nic nie tracą.
 *
 * <p>Login i hasło nadpisujemy tylko wtedy, gdy są zapisane w samym adresie.
 * Gdy adres ich nie zawiera, zostają te z konfiguracji.
 */
public class DatabaseUrlNormalizer implements EnvironmentPostProcessor, Ordered {

    private static final String URL = "spring.datasource.url";
    private static final String USERNAME = "spring.datasource.username";
    private static final String PASSWORD = "spring.datasource.password";
    private static final String NAZWA_ZRODLA = "adres-bazy-znormalizowany";

    /**
     * Uruchamiamy się na końcu, po wczytaniu plików konfiguracyjnych.
     *
     * <p>Bez tego procesor startuje PRZED `ConfigDataEnvironmentPostProcessor`,
     * a wtedy `spring.datasource.url` jeszcze nie istnieje — adres pozostaje
     * nieprzetłumaczony i Spring przewraca się na `'url' must start with "jdbc"`.
     */
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(
            ConfigurableEnvironment environment, SpringApplication application) {
        String surowy = environment.getProperty(URL);
        Map<String, Object> zmiany = przelicz(surowy);
        if (!zmiany.isEmpty()) {
            // Na początek listy, żeby wyprzedzić źródło, z którego przyszedł adres.
            environment.getPropertySources()
                    .addFirst(new MapPropertySource(NAZWA_ZRODLA, zmiany));
        }
    }

    /**
     * Zwraca właściwości do nadpisania. Pusta mapa oznacza „nie ruszamy niczego".
     *
     * <p>Wydzielone z {@link #postProcessEnvironment}, żeby dało się to
     * sprawdzić testem bez podnoszenia kontekstu aplikacji.
     */
    static Map<String, Object> przelicz(String surowy) {
        Map<String, Object> zmiany = new HashMap<>();
        if (surowy == null || surowy.isBlank()) {
            return zmiany;
        }
        String adres = surowy.trim();
        if (!adres.startsWith("postgresql://") && !adres.startsWith("postgres://")) {
            // Adres JDBC albo cokolwiek innego — nie nasza sprawa.
            return zmiany;
        }

        URI uri;
        try {
            uri = URI.create(adres);
        } catch (IllegalArgumentException wyjatek) {
            // Nieparsowalny adres zostawiamy w spokoju: niech Spring zgłosi błąd
            // na oryginalnej wartości, zamiast na naszej przeróbce.
            return zmiany;
        }
        if (uri.getHost() == null) {
            return zmiany;
        }

        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String baza = uri.getPath() == null ? "" : uri.getPath();
        String zapytanie = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
        zmiany.put(URL, "jdbc:postgresql://%s:%d%s%s".formatted(uri.getHost(), port, baza, zapytanie));

        String dane = uri.getRawUserInfo();
        if (dane != null && !dane.isBlank()) {
            int rozdzielnik = dane.indexOf(':');
            String login = rozdzielnik < 0 ? dane : dane.substring(0, rozdzielnik);
            zmiany.put(USERNAME, odkoduj(login));
            if (rozdzielnik >= 0) {
                zmiany.put(PASSWORD, odkoduj(dane.substring(rozdzielnik + 1)));
            }
        }
        return zmiany;
    }

    /** Hasła bywają zakodowane procentowo — `p%40ss` to w rzeczywistości `p@ss`. */
    private static String odkoduj(String wartosc) {
        return URLDecoder.decode(wartosc, StandardCharsets.UTF_8);
    }
}
