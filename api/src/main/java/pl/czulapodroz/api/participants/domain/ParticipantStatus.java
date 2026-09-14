package pl.czulapodroz.api.participants.domain;

/** Stan uczestniczki na liście wyjazdu. */
public enum ParticipantStatus {
    /** Jedzie. */
    CONFIRMED,
    /** Zrezygnowała — zostaje w historii, ale nie liczy się do listy. */
    CANCELLED
}
