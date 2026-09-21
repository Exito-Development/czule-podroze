package pl.czulapodroz.api.contact.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import pl.czulapodroz.api.common.domain.BaseEntity;

/**
 * Wiadomość z formularza kontaktowego na stronie.
 *
 * <p>Zapisujemy ją, zamiast wyłącznie przesyłać dalej: powiadomienie może nie
 * dojść (zły adres, wyłączona poczta, awaria dostawcy), a pytanie od klientki
 * jest wtedy bezpowrotnie stracone. Zapis w bazie sprawia, że organizatorka
 * znajdzie je w panelu niezależnie od tego, czy kanał wysyłki akurat działał.
 */
@Entity
@Table(name = "contact_messages")
public class ContactMessage extends BaseEntity {

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "topic", length = 80)
    private String topic;

    @Column(name = "message", nullable = false, length = 4000)
    private String message;

    /** Odczytana przez organizatorkę — żeby nowe pytania dało się odróżnić. */
    @Column(name = "handled_at")
    private Instant handledAt;

    protected ContactMessage() {}

    public ContactMessage(String name, String email, String phone, String topic, String message) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.topic = topic;
        this.message = message;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getTopic() {
        return topic;
    }

    public String getMessage() {
        return message;
    }

    public Instant getHandledAt() {
        return handledAt;
    }

    public void oznaczJakoObsluzona(Instant moment) {
        this.handledAt = moment;
    }
}
