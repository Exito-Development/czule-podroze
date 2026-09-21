package pl.czulapodroz.api.contact.web;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.contact.ContactService;
import pl.czulapodroz.api.contact.web.dto.ContactDtos.ContactMessageDto;

/** Wiadomości z formularza — widok dla organizatorek. */
@RestController
@RequestMapping("/api/v1/admin/contact")
public class AdminContactController {

    private final ContactService service;

    public AdminContactController(ContactService service) {
        this.service = service;
    }

    @GetMapping
    public List<ContactMessageDto> lista() {
        return service.lista();
    }

    @PostMapping("/{id}/obsluzona")
    public ContactMessageDto oznacz(@PathVariable UUID id) {
        return service.oznaczJakoObsluzona(id);
    }
}
