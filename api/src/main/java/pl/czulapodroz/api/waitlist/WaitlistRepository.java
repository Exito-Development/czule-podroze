package pl.czulapodroz.api.waitlist;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.czulapodroz.api.waitlist.domain.WaitlistEntry;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, UUID> {

    Optional<WaitlistEntry> findByTripIdAndEmail(UUID tripId, String email);

    List<WaitlistEntry> findByTripIdOrderByCreatedAtAsc(UUID tripId);

    List<WaitlistEntry> findAllByOrderByCreatedAtDesc();

    long countByTripId(UUID tripId);
}
