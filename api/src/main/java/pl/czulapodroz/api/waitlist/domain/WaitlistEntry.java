package pl.czulapodroz.api.waitlist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;

/** Zgłoszenie na listę rezerwową wyjazdu bez wolnych miejsc. */
@Entity
@Table(
        name = "waitlist_entries",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_waitlist_trip_email",
                        columnNames = {"trip_id", "email"}))
public class WaitlistEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WaitlistStatus status = WaitlistStatus.WAITING;

    @Column(name = "invited_at")
    private Instant invitedAt;

    protected WaitlistEntry() {
        // wymagane przez JPA
    }

    public WaitlistEntry(Trip trip, String name, String email, String phone) {
        this.trip = trip;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    public void refreshContact(String name, String phone) {
        this.name = name;
        this.phone = phone;
        if (status == WaitlistStatus.CANCELLED) {
            this.status = WaitlistStatus.WAITING;
        }
    }

    public void markInvited(Instant moment) {
        this.status = WaitlistStatus.INVITED;
        this.invitedAt = moment;
    }

    public Trip getTrip() {
        return trip;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public WaitlistStatus getStatus() {
        return status;
    }

    public Instant getInvitedAt() {
        return invitedAt;
    }
}
