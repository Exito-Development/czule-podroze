package pl.czulapodroz.api.order;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.czulapodroz.api.order.domain.OrderStatus;
import pl.czulapodroz.api.order.domain.TripOrder;

public interface OrderRepository extends JpaRepository<TripOrder, UUID> {

    Optional<TripOrder> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    List<TripOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<TripOrder> findByCustomerEmailOrderByCreatedAtDesc(String email);

    List<TripOrder> findByStatusAndPaymentDeadlineBefore(OrderStatus status, Instant moment);

    List<TripOrder> findAllByOrderByCreatedAtDesc();
}
