package pl.czulapodroz.api.messaging;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Konfiguracja wysyłki.
 *
 * @param provider  aktywny kanał: `log` (domyślnie, środowisko lokalne) albo `smtp`
 * @param fromName  nazwa nadawcy widoczna w skrzynce odbiorczyni
 * @param fromEmail adres nadawcy
 * @param signature stopka doklejana do każdej wiadomości
 */
@ConfigurationProperties(prefix = "czula.messaging")
public record MessagingProperties(
        String provider, String fromName, String fromEmail, String signature) {

    public MessagingProperties {
        provider = provider == null ? "log" : provider;
        fromName = fromName == null ? "Czuła Podróż" : fromName;
        fromEmail = fromEmail == null ? "kontakt@czulapodroz.pl" : fromEmail;
        signature =
                signature == null
                        ? "Do zobaczenia w podróży,\nWika i Natka\nCzuła Podróż"
                        : signature;
    }
}
