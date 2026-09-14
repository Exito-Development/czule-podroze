package pl.czulapodroz.api.auth.domain;

/** Role w systemie. */
public enum UserRole {
    /** Klientka — widzi swoje rezerwacje. */
    CUSTOMER,
    /** Organizatorka — zarządza ofertą i zamówieniami. */
    ADMIN;

    public String authority() {
        return "ROLE_" + name();
    }
}
