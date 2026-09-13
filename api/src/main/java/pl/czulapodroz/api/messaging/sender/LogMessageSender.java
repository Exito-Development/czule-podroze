package pl.czulapodroz.api.messaging.sender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import pl.czulapodroz.api.messaging.MessageSender;

/**
 * Kanał domyślny: wiadomość trafia do logu zamiast do skrzynki.
 *
 * Dzięki temu cała ścieżka (wybór odbiorczyń, personalizacja, historia wysyłek)
 * jest w pełni przeklikiwalna lokalnie — bez konta SMTP i bez ryzyka, że test
 * wyśle maila do prawdziwej klientki.
 */
@Component
@ConditionalOnProperty(name = "czula.messaging.provider", havingValue = "log", matchIfMissing = true)
public class LogMessageSender implements MessageSender {

    private static final Logger log = LoggerFactory.getLogger(LogMessageSender.class);

    @Override
    public String providerName() {
        return "log";
    }

    @Override
    public void send(OutgoingMessage message) {
        log.info(
                "[WIADOMOŚĆ] do: {} <{}>\nTemat: {}\n{}",
                message.toName(),
                message.toEmail(),
                message.subject(),
                message.body());
    }
}
