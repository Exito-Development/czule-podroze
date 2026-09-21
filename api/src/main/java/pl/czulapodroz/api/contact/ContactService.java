package pl.czulapodroz.api.contact;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.contact.domain.ContactMessage;
import pl.czulapodroz.api.contact.web.dto.ContactDtos.ContactMessageDto;
import pl.czulapodroz.api.contact.web.dto.ContactDtos.ContactRequest;
import pl.czulapodroz.api.contact.web.dto.ContactDtos.ContactResponse;
import pl.czulapodroz.api.messaging.MessageSender;
import pl.czulapodroz.api.messaging.MessagingProperties;

/** Obsługa wiadomości z formularza kontaktowego. */
@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactMessageRepository repository;
    private final MessageSender sender;
    private final MessagingProperties messagingProperties;
    private final Clock clock;

    public ContactService(
            ContactMessageRepository repository,
            MessageSender sender,
            MessagingProperties messagingProperties,
            Clock clock) {
        this.repository = repository;
        this.sender = sender;
        this.messagingProperties = messagingProperties;
        this.clock = clock;
    }

    @Transactional
    public ContactResponse przyjmij(ContactRequest request) {
        ContactMessage wiadomosc =
                repository.save(
                        new ContactMessage(
                                request.name().trim(),
                                request.email().trim().toLowerCase(),
                                pustyNaNull(request.phone()),
                                pustyNaNull(request.topic()),
                                request.message().trim()));

        powiadomOrganizatorki(wiadomosc);
        return new ContactResponse(wiadomosc.getId(), wiadomosc.getCreatedAt());
    }

    /**
     * Powiadomienie jest dodatkiem, nie warunkiem przyjęcia wiadomości.
     *
     * <p>Wiadomość jest już zapisana, więc awaria poczty nie może wywrócić
     * żądania — klientka dostałaby błąd, mimo że jej pytanie dotarło. Zamiast
     * tego zostawiamy ślad w logu; wiadomość i tak czeka w panelu.
     */
    private void powiadomOrganizatorki(ContactMessage wiadomosc) {
        String tresc =
                """
                Nowa wiadomość z formularza na stronie.

                Od: %s <%s>
                Telefon: %s
                Temat: %s

                %s
                """
                        .formatted(
                                wiadomosc.getName(),
                                wiadomosc.getEmail(),
                                wiadomosc.getPhone() == null ? "nie podano" : wiadomosc.getPhone(),
                                wiadomosc.getTopic() == null ? "nie podano" : wiadomosc.getTopic(),
                                wiadomosc.getMessage());
        try {
            sender.send(
                    new MessageSender.OutgoingMessage(
                            messagingProperties.fromName(),
                            messagingProperties.fromEmail(),
                            "Pytanie ze strony: " + wiadomosc.getName(),
                            tresc));
        } catch (RuntimeException wyjatek) {
            log.warn(
                    "Nie udało się powiadomić o wiadomości {} — czeka w panelu",
                    wiadomosc.getId(),
                    wyjatek);
        }
    }

    @Transactional(readOnly = true)
    public List<ContactMessageDto> lista() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(ContactService::naDto).toList();
    }

    @Transactional
    public ContactMessageDto oznaczJakoObsluzona(UUID id) {
        ContactMessage wiadomosc =
                repository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "contact.notFound", "Nie ma takiej wiadomości"));
        wiadomosc.oznaczJakoObsluzona(Instant.now(clock));
        return naDto(wiadomosc);
    }

    private static ContactMessageDto naDto(ContactMessage wiadomosc) {
        return new ContactMessageDto(
                wiadomosc.getId(),
                wiadomosc.getCreatedAt(),
                wiadomosc.getName(),
                wiadomosc.getEmail(),
                wiadomosc.getPhone(),
                wiadomosc.getTopic(),
                wiadomosc.getMessage(),
                wiadomosc.getHandledAt());
    }

    private static String pustyNaNull(String wartosc) {
        return wartosc == null || wartosc.isBlank() ? null : wartosc.trim();
    }
}
