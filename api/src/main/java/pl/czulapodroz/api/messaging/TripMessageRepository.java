package pl.czulapodroz.api.messaging;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.czulapodroz.api.messaging.domain.TripMessage;

public interface TripMessageRepository extends JpaRepository<TripMessage, UUID> {

    List<TripMessage> findByTripIdOrderBySentAtDesc(UUID tripId);

    List<TripMessage> findAllByOrderBySentAtDesc();
}
