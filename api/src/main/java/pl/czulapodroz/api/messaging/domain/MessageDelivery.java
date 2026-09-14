package pl.czulapodroz.api.messaging.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import pl.czulapodroz.api.common.domain.BaseEntity;

/** Wynik doręczenia wiadomości do jednej osoby. */
@Entity
@Table(name = "message_deliveries")
public class MessageDelivery extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private TripMessage message;

    @Column(name = "recipient_name", length = 240)
    private String recipientName;

    @Column(name = "recipient_email", nullable = false, length = 320)
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DeliveryStatus status;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    protected MessageDelivery() {
        // wymagane przez JPA
    }

    public MessageDelivery(
            TripMessage message,
            String recipientName,
            String recipientEmail,
            DeliveryStatus status,
            String failureReason) {
        this.message = message;
        this.recipientName = recipientName;
        this.recipientEmail = recipientEmail;
        this.status = status;
        this.failureReason = failureReason;
    }

    public TripMessage getMessage() {
        return message;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public String getFailureReason() {
        return failureReason;
    }
}
