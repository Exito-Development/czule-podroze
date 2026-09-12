package pl.czulapodroz.api.payment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import pl.czulapodroz.api.common.domain.BaseEntity;
import pl.czulapodroz.api.order.domain.TripOrder;

/** Próba płatności u operatora (Przelewy24 / Stripe / mock w środowisku lokalnym). */
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private TripOrder order;

    @Column(name = "provider", nullable = false, length = 40)
    private String provider;

    /** Identyfikator transakcji po stronie operatora. */
    @Column(name = "external_id", nullable = false, unique = true, length = 120)
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "redirect_url", nullable = false, length = 1000)
    private String redirectUrl;

    @Column(name = "settled_at")
    private Instant settledAt;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    protected Payment() {
        // wymagane przez JPA
    }

    public Payment(
            TripOrder order,
            String provider,
            String externalId,
            BigDecimal amount,
            String currency,
            String redirectUrl) {
        this.order = order;
        this.provider = provider;
        this.externalId = externalId;
        this.amount = amount;
        this.currency = currency;
        this.redirectUrl = redirectUrl;
    }

    public boolean isPending() {
        return status == PaymentStatus.PENDING;
    }

    public void succeed(Instant moment) {
        this.status = PaymentStatus.SUCCEEDED;
        this.settledAt = moment;
    }

    public void fail(Instant moment, String reason) {
        this.status = PaymentStatus.FAILED;
        this.settledAt = moment;
        this.failureReason = reason;
    }

    public void cancel(Instant moment) {
        this.status = PaymentStatus.CANCELLED;
        this.settledAt = moment;
    }

    public TripOrder getOrder() {
        return order;
    }

    public String getProvider() {
        return provider;
    }

    public String getExternalId() {
        return externalId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public Instant getSettledAt() {
        return settledAt;
    }

    public String getFailureReason() {
        return failureReason;
    }
}
