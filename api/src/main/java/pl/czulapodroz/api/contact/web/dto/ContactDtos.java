package pl.czulapodroz.api.contact.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class ContactDtos {

    private ContactDtos() {}

    /**
     * Wiadomość z formularza na stronie.
     *
     * @param botField pułapka na roboty — pole ukryte w formularzu, którego
     *     człowiek nie wypełni. Wypełnione oznacza automat; odrzucamy wtedy
     *     wiadomość, nie zdradzając powodu.
     */
    public record ContactRequest(
            @NotBlank(message = "Podaj imię") @Size(max = 160) String name,
            @NotBlank(message = "Podaj adres e-mail")
                    @Email(message = "To nie wygląda na adres e-mail")
                    @Size(max = 320)
                    String email,
            @Size(max = 40) String phone,
            @Size(max = 80) String topic,
            @NotBlank(message = "Napisz wiadomość") @Size(max = 4000) String message,
            @Size(max = 200) String botField) {}

    public record ContactResponse(UUID id, Instant createdAt) {}

    /** Widok dla panelu organizatorki. */
    public record ContactMessageDto(
            UUID id,
            Instant createdAt,
            String name,
            String email,
            String phone,
            String topic,
            String message,
            Instant handledAt) {}
}
