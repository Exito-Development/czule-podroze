package pl.czulapodroz.api.payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.czulapodroz.api.payment.domain.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByExternalId(String externalId);

    List<Payment> findByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
