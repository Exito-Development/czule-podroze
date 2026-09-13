package pl.czulapodroz.api.messaging.sender;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import pl.czulapodroz.api.messaging.MessageSender;
import pl.czulapodroz.api.messaging.MessagingProperties;

/**
 * Wysyłka e-mailem przez SMTP (produkcja).
 *
 * Włącza się przy `czula.messaging.provider=smtp`; dane serwera pochodzą
 * ze standardowej konfiguracji `spring.mail.*`.
 */
@Component
@ConditionalOnProperty(name = "czula.messaging.provider", havingValue = "smtp")
public class SmtpMessageSender implements MessageSender {

    private final JavaMailSender mailSender;
    private final MessagingProperties properties;

    public SmtpMessageSender(JavaMailSender mailSender, MessagingProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    public String providerName() {
        return "smtp";
    }

    @Override
    public void send(OutgoingMessage message) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mime, false, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(properties.fromEmail(), properties.fromName()));
            helper.setTo(message.toEmail());
            helper.setSubject(message.subject());
            helper.setText(message.body(), false);
            mailSender.send(mime);
        } catch (UnsupportedEncodingException | jakarta.mail.MessagingException
                | org.springframework.mail.MailException exception) {
            throw new MessageDeliveryException(
                    "Nie udało się wysłać wiadomości na " + message.toEmail(), exception);
        }
    }
}
