package pl.czulapodroz.api.cart.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;
import pl.czulapodroz.api.common.domain.PaymentMode;

/** Jeden wyjazd w koszyku wraz z liczbą miejsc i wybranym sposobem płatności. */
@Entity
@Table(name = "cart_items")
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "seats", nullable = false)
    private int seats;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 20)
    private PaymentMode paymentMode;

    protected CartItem() {
        // wymagane przez JPA
    }

    public CartItem(Cart cart, Trip trip, int seats, PaymentMode paymentMode) {
        this.cart = cart;
        this.trip = trip;
        this.seats = seats;
        this.paymentMode = paymentMode;
    }

    public void update(int seats, PaymentMode paymentMode) {
        this.seats = seats;
        this.paymentMode = paymentMode;
    }

    public Cart getCart() {
        return cart;
    }

    public Trip getTrip() {
        return trip;
    }

    public int getSeats() {
        return seats;
    }

    public PaymentMode getPaymentMode() {
        return paymentMode;
    }
}
