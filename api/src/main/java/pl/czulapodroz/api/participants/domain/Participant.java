package pl.czulapodroz.api.participants.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.domain.BaseEntity;
import pl.czulapodroz.api.order.domain.TripOrder;

/**
 * Jedna osoba na jednym miejscu w wyjeździe.
 *
 * Zamówienie na trzy miejsca daje trzy uczestniczki, ale znamy dane tylko
 * tej, która rezerwowała — pozostałe wiersze powstają puste i organizatorki
 * uzupełniają je w panelu. Dzięki temu lista wyjazdu od początku zgadza się
 * z liczbą sprzedanych miejsc, a nie z liczbą zamówień.
 */
@Entity
@Table(
        name = "participants",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_participants_seat",
                        columnNames = {"order_item_id", "seat_number"}))
public class Participant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private TripOrder order;

    /** Pozycja zamówienia, z której pochodzi to miejsce. */
    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    /** Numer miejsca w ramach pozycji zamówienia (1..n). */
    @Column(name = "seat_number", nullable = false)
    private int seatNumber;

    @Column(name = "first_name", length = 120)
    private String firstName;

    @Column(name = "last_name", length = 120)
    private String lastName;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    /** Dieta, alergie, potrzeby — to, co organizatorki muszą wiedzieć. */
    @Column(name = "note", length = 2000)
    private String note;

    /** Czy to osoba, która rezerwowała (kontakt do całej rezerwacji). */
    @Column(name = "contact_person", nullable = false)
    private boolean contactPerson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ParticipantStatus status = ParticipantStatus.CONFIRMED;

    protected Participant() {
        // wymagane przez JPA
    }

    public Participant(
            Trip trip, TripOrder order, UUID orderItemId, int seatNumber, boolean contactPerson) {
        this.trip = trip;
        this.order = order;
        this.orderItemId = orderItemId;
        this.seatNumber = seatNumber;
        this.contactPerson = contactPerson;
    }

    /** Czy wiersz czeka na uzupełnienie danych przez organizatorki. */
    public boolean isIncomplete() {
        return isBlank(firstName) && isBlank(lastName);
    }

    /** Czy da się do tej osoby cokolwiek wysłać. */
    public boolean hasEmail() {
        return !isBlank(email);
    }

    public String displayName() {
        if (isIncomplete()) {
            return "Miejsce " + seatNumber + " — do uzupełnienia";
        }
        return String.join(" ", nullToEmpty(firstName), nullToEmpty(lastName)).trim();
    }

    public void updateDetails(
            String firstName, String lastName, String email, String phone, String note) {
        this.firstName = trimToNull(firstName);
        this.lastName = trimToNull(lastName);
        this.email = normalizeEmail(email);
        this.phone = trimToNull(phone);
        this.note = trimToNull(note);
    }

    public void cancel() {
        this.status = ParticipantStatus.CANCELLED;
    }

    public void restore() {
        this.status = ParticipantStatus.CONFIRMED;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String normalizeEmail(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toLowerCase(java.util.Locale.ROOT);
    }

    public Trip getTrip() {
        return trip;
    }

    public TripOrder getOrder() {
        return order;
    }

    public UUID getOrderItemId() {
        return orderItemId;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getNote() {
        return note;
    }

    public boolean isContactPerson() {
        return contactPerson;
    }

    public ParticipantStatus getStatus() {
        return status;
    }
}
