package pl.czulapodroz.api.common.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("Tłumaczenie adresu bazy na JDBC")
class DatabaseUrlNormalizerTest {

    private static final String URL = "spring.datasource.url";
    private static final String USERNAME = "spring.datasource.username";
    private static final String PASSWORD = "spring.datasource.password";

    @Nested
    @DisplayName("adres z platformy hostingowej")
    class AdresPlatformy {

        @Test
        @DisplayName("rozbija się na adres JDBC, login i hasło")
        void pelnyAdres() {
            Map<String, Object> wynik =
                    DatabaseUrlNormalizer.przelicz(
                            "postgresql://czula:tajne@monorail.proxy.rlwy.net:53342/railway");

            assertThat(wynik)
                    .containsEntry(URL, "jdbc:postgresql://monorail.proxy.rlwy.net:53342/railway")
                    .containsEntry(USERNAME, "czula")
                    .containsEntry(PASSWORD, "tajne");
        }

        @Test
        @DisplayName("przedrostek `postgres://` działa tak samo jak `postgresql://`")
        void krotszyPrzedrostek() {
            assertThat(DatabaseUrlNormalizer.przelicz("postgres://u:h@db.internal:5432/czula"))
                    .containsEntry(URL, "jdbc:postgresql://db.internal:5432/czula");
        }

        @Test
        @DisplayName("brak portu uzupełnia domyślnym 5432")
        void bezPortu() {
            assertThat(DatabaseUrlNormalizer.przelicz("postgresql://u:h@db.internal/czula"))
                    .containsEntry(URL, "jdbc:postgresql://db.internal:5432/czula");
        }

        @Test
        @DisplayName("parametry połączenia zostają zachowane")
        void zParametrami() {
            assertThat(
                            DatabaseUrlNormalizer.przelicz(
                                    "postgresql://u:h@db.internal:5432/czula?sslmode=require"))
                    .containsEntry(URL, "jdbc:postgresql://db.internal:5432/czula?sslmode=require");
        }

        @Test
        @DisplayName("hasło zakodowane procentowo wraca do postaci pierwotnej")
        void hasloZeZnakamiSpecjalnymi() {
            // Hasło `p@ss:w/ord` w adresie MUSI być zakodowane, inaczej rozbiłoby
            // jego strukturę. Do sterownika ma trafić już rozkodowane.
            assertThat(
                            DatabaseUrlNormalizer.przelicz(
                                    "postgresql://czula:p%40ss%3Aw%2Ford@db.internal:5432/czula"))
                    .containsEntry(PASSWORD, "p@ss:w/ord");
        }

        @Test
        @DisplayName("adres bez danych logowania nie rusza loginu ani hasła")
        void bezDanychLogowania() {
            Map<String, Object> wynik =
                    DatabaseUrlNormalizer.przelicz("postgresql://db.internal:5432/czula");

            assertThat(wynik).containsEntry(URL, "jdbc:postgresql://db.internal:5432/czula");
            assertThat(wynik).doesNotContainKeys(USERNAME, PASSWORD);
        }
    }

    @Nested
    @DisplayName("adresy, których nie ruszamy")
    class BezZmian {

        @Test
        @DisplayName("gotowy adres JDBC zostaje nietknięty")
        void juzJdbc() {
            assertThat(DatabaseUrlNormalizer.przelicz("jdbc:postgresql://db:5432/czula")).isEmpty();
        }

        @Test
        @DisplayName("H2 z profilu lokalnego zostaje nietknięte")
        void h2() {
            assertThat(DatabaseUrlNormalizer.przelicz("jdbc:h2:file:./.data/czula")).isEmpty();
        }

        @Test
        @DisplayName("brak adresu nie powoduje błędu")
        void brakAdresu() {
            assertThat(DatabaseUrlNormalizer.przelicz(null)).isEmpty();
            assertThat(DatabaseUrlNormalizer.przelicz("   ")).isEmpty();
        }

        @Test
        @DisplayName("nieparsowalny adres zostawiamy Springowi do zgłoszenia")
        void adresNieDoOdczytania() {
            assertThat(DatabaseUrlNormalizer.przelicz("postgresql://")).isEmpty();
        }
    }
}
