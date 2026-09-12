package pl.czulapodroz.api.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;
import pl.czulapodroz.api.common.domain.PaymentMode;

/**
 * Pozycja zamówienia z zamrożoną ceną.
 *
 * Ceny kopiujemy w chwili złożenia zamówienia — późniejsza zmiana cennika
 * nie może zmienić kwoty, na którą klientka się zgodziła.
 */
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private TripOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "trip_slug", nullable = false, length = 120)
    private String tripSlug;

    @Column(name = "trip_title", nullable = false, length = 160)
    private String tripTitle;

    @Column(name = "seats", nullable = false)
    private int seats;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 20)
    private PaymentMode paymentMode;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "deposit_per_seat", nullable = false, precision = 12, scale = 2)
    private BigDecimal depositPerSeat;

    @Column(name = "amount_due_now", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDueNow;

    @Column(name = "trip_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal tripTotal;

    protected OrderItem() {
        // wymagane przez JPA
    }

    public OrderItem(TripOrder order, Trip trip, int seats, PaymentMode paymentMode) {
        this.order = order;
        this.trip = trip;
        this.tripSlug = trip.getSlug();
        this.tripTitle = trip.getTitle();
        this.seats = seats;
        this.paymentMode = paymentMode;
        this.unitPrice = trip.getPrice();
        this.depositPerSeat = trip.getDeposit();

        BigDecimal seatCount = BigDecimal.valueOf(seats);
        this.amountDueNow =
                paymentMode.amountDuePerSeat(trip.getPrice(), trip.getDeposit()).multiply(seatCount);
        this.tripTotal = trip.getPrice().multiply(seatCount);
    }

    /** Ile zostaje do dopłaty przed wyjazdem. */
    public BigDecimal balanceDue() {
        return tripTotal.subtract(amountDueNow);
    }

    public TripOrder getOrder() {
        return order;
    }

    public Trip getTrip() {
        return trip;
    }

    public String getTripSlug() {
        return tripSlug;
    }

    public String getTripTitle() {
        return tripTitle;
    }

    public int getSeats() {
        return seats;
    }

    public PaymentMode getPaymentMode() {
        return paymentMode;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getDepositPerSeat() {
        return depositPerSeat;
    }

    public BigDecimal getAmountDueNow() {
        return amountDueNow;
    }

    public BigDecimal getTripTotal() {
        return tripTotal;
    }
}
