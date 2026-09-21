package pl.czulapodroz.api.contact;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.czulapodroz.api.contact.domain.ContactMessage;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, UUID> {

    /** Najnowsze na górze — organizatorka zaczyna od tego, co świeże. */
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
}
