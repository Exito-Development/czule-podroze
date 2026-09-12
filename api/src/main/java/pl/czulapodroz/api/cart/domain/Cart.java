package pl.czulapodroz.api.cart.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;
import pl.czulapodroz.api.common.domain.PaymentMode;

/**
 * Koszyk „Mój wyjazd".
 *
 * Koszyk jest anonimowy — jego identyfikator wystarcza, żeby go czytać
 * i zmieniać. To świadomy wybór: klientka może zacząć rezerwację bez
 * zakładania konta, a identyfikator (UUID v4) jest nieodgadywalny. Gdy jest
 * zalogowana, koszyk zostaje do niej przypisany.
 */
@Entity
@Table(name = "carts")
public class Cart extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CartStatus status = CartStatus.ACTIVE;

    @Column(name = "user_id")
    private UUID userId;

    @OneToMany(
            mappedBy = "cart",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<CartItem> items = new ArrayList<>();

    public Cart() {
        // koszyk gościa
    }

    public Cart(UUID userId) {
        this.userId = userId;
    }

    public boolean isEditable() {
        return status == CartStatus.ACTIVE;
    }

    public Optional<CartItem> findItemByTrip(UUID tripId) {
        return items.stream().filter(item -> item.getTrip().getId().equals(tripId)).findFirst();
    }

    public Optional<CartItem> findItem(UUID itemId) {
        return items.stream().filter(item -> item.getId().equals(itemId)).findFirst();
    }

    public CartItem putItem(Trip trip, int seats, PaymentMode paymentMode) {
        return findItemByTrip(trip.getId())
                .map(
                        existing -> {
                            existing.update(seats, paymentMode);
                            return existing;
                        })
                .orElseGet(
                        () -> {
                            CartItem item = new CartItem(this, trip, seats, paymentMode);
                            items.add(item);
                            return item;
                        });
    }

    public void removeItem(CartItem item) {
        items.remove(item);
    }

    public void markOrdered() {
        this.status = CartStatus.ORDERED;
    }

    public void abandon() {
        this.status = CartStatus.ABANDONED;
    }

    public void assignTo(UUID userId) {
        this.userId = userId;
    }

    public CartStatus getStatus() {
        return status;
    }

    public UUID getUserId() {
        return userId;
    }

    public List<CartItem> getItems() {
        return List.copyOf(items);
    }
}
