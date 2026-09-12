package pl.czulapodroz.api.inventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;

/**
 * Czasowa blokada miejsc na wyjeździe.
 *
 * Powstaje w chwili dodania wyjazdu do koszyka i wygasa po `expiresAt`, jeśli
 * klientka nie dokończy zamówienia. Dzięki temu miejsce „trzyma się" przez
 * czas zakupów, ale nie znika z oferty na zawsze, gdy ktoś porzuci koszyk.
 */
@Entity
@Table(name = "seat_holds")
public class SeatHold extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "cart_id", nullable = false)
    private UUID cartId;

    /** Wypełniane, gdy koszyk zamienia się w zamówienie. */
    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "seats", nullable = false)
    private int seats;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SeatHoldStatus status = SeatHoldStatus.ACTIVE;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected SeatHold() {
        // wymagane przez JPA
    }

    public SeatHold(Trip trip, UUID cartId, int seats, Instant expiresAt) {
        this.trip = trip;
        this.cartId = cartId;
        this.seats = seats;
        this.expiresAt = expiresAt;
    }

    public boolean isActiveAt(Instant moment) {
        return status == SeatHoldStatus.ACTIVE && expiresAt.isAfter(moment);
    }

    public void resize(int newSeats, Instant newExpiry) {
        this.seats = newSeats;
        this.status = SeatHoldStatus.ACTIVE;
        this.expiresAt = newExpiry;
    }

    public void prolong(Instant newExpiry) {
        this.expiresAt = newExpiry;
    }

    public void release() {
        this.status = SeatHoldStatus.RELEASED;
    }

    public void expire() {
        this.status = SeatHoldStatus.EXPIRED;
    }

    public void convert() {
        this.status = SeatHoldStatus.CONVERTED;
    }

    public void attachToOrder(UUID orderId, Instant paymentDeadline) {
        this.orderId = orderId;
        this.expiresAt = paymentDeadline;
    }

    public Trip getTrip() {
        return trip;
    }

    public UUID getCartId() {
        return cartId;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public int getSeats() {
        return seats;
    }

    public SeatHoldStatus getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}
