package pl.czulapodroz.api.order.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import pl.czulapodroz.api.common.domain.BaseEntity;

/**
 * Zamówienie na wyjazd.
 *
 * Nazwa `TripOrder` zamiast `Order`, bo `ORDER` jest słowem kluczowym SQL —
 * tabela nazywa się `orders`, a klasa nie koliduje z niczym w imporcie.
 *
 * Zamówienie zna swój stan i sama pilnuje przejść: opłacić można tylko
 * zamówienie oczekujące na płatność, a opłacone jest niezmienne.
 */
@Entity
@Table(name = "orders")
public class TripOrder extends BaseEntity {

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(name = "cart_id", nullable = false)
    private UUID cartId;

    @Column(name = "user_id")
    private UUID userId;

    @Embedded private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(name = "amount_due_now", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDueNow = BigDecimal.ZERO;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "trip_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal tripTotal = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "PLN";

    @Column(name = "payment_deadline", nullable = false)
    private Instant paymentDeadline;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    /** Skrót tokenu z linku „podejrzyj rezerwację" — samego tokenu nie trzymamy. */
    @Column(name = "access_token_hash", nullable = false, length = 64)
    private String accessTokenHash;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    protected TripOrder() {
        // wymagane przez JPA
    }

    public TripOrder(
            String orderNumber,
            UUID cartId,
            UUID userId,
            Customer customer,
            String accessTokenHash,
            Instant paymentDeadline) {
        this.orderNumber = orderNumber;
        this.cartId = cartId;
        this.userId = userId;
        this.customer = customer;
        this.accessTokenHash = accessTokenHash;
        this.paymentDeadline = paymentDeadline;
    }

    public OrderItem addItem(OrderItem item) {
        items.add(item);
        recalculateTotals();
        return item;
    }

    private void recalculateTotals() {
        amountDueNow =
                items.stream()
                        .map(OrderItem::getAmountDueNow)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        tripTotal =
                items.stream().map(OrderItem::getTripTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Kwota, która zostaje do dopłaty przed wyjazdem. */
    public BigDecimal balanceDue() {
        return tripTotal.subtract(amountPaid).max(BigDecimal.ZERO);
    }

    public boolean isPaid() {
        return status == OrderStatus.CONFIRMED;
    }

    public boolean awaitsPayment() {
        return status == OrderStatus.PENDING_PAYMENT;
    }

    /**
     * Księguje płatność.
     *
     * @return {@code true} gdy to ta płatność zmieniła stan zamówienia;
     *     {@code false} gdy zamówienie było już opłacone (powtórzony webhook).
     */
    public boolean markPaid(BigDecimal amount, Instant moment) {
        if (status == OrderStatus.CONFIRMED) {
            return false;
        }
        if (status != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException(
                    "Nie można opłacić zamówienia w stanie " + status);
        }
        this.amountPaid = amountPaid.add(amount);
        this.status = OrderStatus.CONFIRMED;
        this.paidAt = moment;
        return true;
    }

    public void cancel(Instant moment) {
        if (status == OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Opłacone zamówienie anuluje organizatorka ręcznie");
        }
        this.status = OrderStatus.CANCELLED;
        this.cancelledAt = moment;
    }

    public void expire(Instant moment) {
        if (status == OrderStatus.PENDING_PAYMENT) {
            this.status = OrderStatus.EXPIRED;
            this.cancelledAt = moment;
        }
    }

    public void assignToUser(UUID userId) {
        this.userId = userId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public UUID getCartId() {
        return cartId;
    }

    public UUID getUserId() {
        return userId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getAmountDueNow() {
        return amountDueNow;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public BigDecimal getTripTotal() {
        return tripTotal;
    }

    public String getCurrency() {
        return currency;
    }

    public Instant getPaymentDeadline() {
        return paymentDeadline;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public String getAccessTokenHash() {
        return accessTokenHash;
    }

    public List<OrderItem> getItems() {
        return List.copyOf(items);
    }
}
