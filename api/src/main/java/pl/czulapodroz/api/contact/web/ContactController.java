package pl.czulapodroz.api.contact.web;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.contact.ContactService;
import pl.czulapodroz.api.contact.web.dto.ContactDtos.ContactRequest;
import pl.czulapodroz.api.contact.web.dto.ContactDtos.ContactResponse;

/** Formularz kontaktowy — dostępny bez logowania. */
@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final ContactService service;

    public ContactController(ContactService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ContactResponse> wyslij(@Valid @RequestBody ContactRequest request) {
        if (request.botField() != null && !request.botField().isBlank()) {
            // Automatom odpowiadamy tak samo jak ludziom. Komunikat o odrzuceniu
            // byłby dla nich wskazówką, jak ominąć pułapkę następnym razem.
            log.info("Odrzucono wiadomość z wypełnionym polem-pułapką");
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(new ContactResponse(null, null));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.przyjmij(request));
    }
}
