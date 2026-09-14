package pl.czulapodroz.api.participants;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.czulapodroz.api.participants.domain.Participant;
import pl.czulapodroz.api.participants.domain.ParticipantStatus;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {

    @Query(
            """
            select p from Participant p
            where p.trip.id = :tripId
            order by p.order.orderNumber asc, p.seatNumber asc
            """)
    List<Participant> findForTrip(@Param("tripId") UUID tripId);

    List<Participant> findByOrderId(UUID orderId);

    List<Participant> findByOrderItemId(UUID orderItemId);

    long countByTripIdAndStatus(UUID tripId, ParticipantStatus status);
}
