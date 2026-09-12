package pl.czulapodroz.api.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Dane kontaktowe podane przy zamówieniu. */
@Embeddable
public class Customer {

    @Column(name = "customer_first_name", nullable = false, length = 120)
    private String firstName;

    @Column(name = "customer_last_name", nullable = false, length = 120)
    private String lastName;

    @Column(name = "customer_email", nullable = false, length = 320)
    private String email;

    @Column(name = "customer_phone", length = 40)
    private String phone;

    @Column(name = "customer_note", length = 2000)
    private String note;

    protected Customer() {
        // wymagane przez JPA
    }

    public Customer(String firstName, String lastName, String email, String phone, String note) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.note = note;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String fullName() {
        return firstName + " " + lastName;
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
}
