package pl.czulapodroz.api.cart;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.czulapodroz.api.cart.domain.Cart;
import pl.czulapodroz.api.cart.domain.CartStatus;

public interface CartRepository extends JpaRepository<Cart, UUID> {

    List<Cart> findByUserIdAndStatus(UUID userId, CartStatus status);

    List<Cart> findByStatusAndUpdatedAtBefore(CartStatus status, Instant moment);
}
