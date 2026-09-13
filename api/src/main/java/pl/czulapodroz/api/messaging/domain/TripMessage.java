package pl.czulapodroz.api.messaging.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;

/**
 * Wiadomość wysłana do grupy odbiorczyń wyjazdu.
 *
 * Trzymamy ją razem z wynikiem każdego doręczenia — organizatorki muszą móc
 * sprawdzić, czy konkretna osoba faktycznie dostała informację o zmianie
 * godziny zbiórki, a nie tylko „czy wysłaliśmy".
 */
@Entity
@Table(name = "trip_messages")
public class TripMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "subject", nullable = false, length = 200)
    private String subject;

    @Column(name = "body", nullable = false, length = 10000)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", nullable = false, length = 30)
    private MessageAudience audience;

    @Column(name = "sent_by", nullable = false, length = 320)
    private String sentBy;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "recipient_count", nullable = false)
    private int recipientCount;

    @Column(name = "failed_count", nullable = false)
    private int failedCount;

    @Column(name = "provider", nullable = false, length = 40)
    private String provider;

    @OneToMany(
            mappedBy = "message",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<MessageDelivery> deliveries = new ArrayList<>();

    protected TripMessage() {
        // wymagane przez JPA
    }

    public TripMessage(
            Trip trip,
            String subject,
            String body,
            MessageAudience audience,
            String sentBy,
            String provider,
            Instant sentAt) {
        this.trip = trip;
        this.subject = subject;
        this.body = body;
        this.audience = audience;
        this.sentBy = sentBy;
        this.provider = provider;
        this.sentAt = sentAt;
    }

    public void addDelivery(MessageDelivery delivery) {
        deliveries.add(delivery);
        recipientCount = deliveries.size();
        failedCount =
                (int)
                        deliveries.stream()
                                .filter(d -> d.getStatus() == DeliveryStatus.FAILED)
                                .count();
    }

    public Trip getTrip() {
        return trip;
    }

    public String getSubject() {
        return subject;
    }

    public String getBody() {
        return body;
    }

    public MessageAudience getAudience() {
        return audience;
    }

    public String getSentBy() {
        return sentBy;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public int getRecipientCount() {
        return recipientCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public String getProvider() {
        return provider;
    }

    public List<MessageDelivery> getDeliveries() {
        return List.copyOf(deliveries);
    }
}
