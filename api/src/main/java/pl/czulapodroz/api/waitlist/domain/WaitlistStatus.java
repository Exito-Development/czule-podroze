package pl.czulapodroz.api.waitlist.domain;

/** Stan zgłoszenia na listę rezerwową. */
public enum WaitlistStatus {
    /** Czeka na zwolnione miejsce. */
    WAITING,
    /** Organizatorki wysłały propozycję miejsca. */
    INVITED,
    /** Zgłoszenie zamieniło się w rezerwację. */
    CONVERTED,
    /** Rezygnacja. */
    CANCELLED
}
