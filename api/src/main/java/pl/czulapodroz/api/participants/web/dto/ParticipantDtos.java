package pl.czulapodroz.api.participants.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

/** Kontrakty listy uczestniczek wyjazdu. */
public final class ParticipantDtos {

    private ParticipantDtos() {}

    public record UpdateParticipantRequest(
            @Size(max = 120) String firstName,
            @Size(max = 120) String lastName,
            @Email @Size(max = 320) String email,
            @Size(max = 40) String phone,
            @Size(max = 2000) String note) {}

    /**
     * Jedno miejsce na wyjeździe wraz z kontekstem rezerwacji.
     *
     * @param incomplete  miejsce sprzedane, ale bez danych osoby — do uzupełnienia
     * @param balanceDue  ile zostaje do dopłaty na całym zamówieniu
     */
    public record ParticipantResponse(
            String id,
            String displayName,
            String firstName,
            String lastName,
            String email,
            String phone,
            String note,
            boolean contactPerson,
            boolean incomplete,
            String status,
            int seatNumber,
            String orderNumber,
            String orderStatus,
            String paymentMode,
            BigDecimal balanceDue,
            String bookedByName,
            String bookedByEmail) {}

    /**
     * @param seatsSold    miejsca sprzedane (opłacone)
     * @param seatsPending miejsca w zamówieniach czekających na płatność
     * @param incomplete   ile wierszy czeka na dane osoby
     * @param balanceDue   suma dopłat do zebrania przed wyjazdem
     */
    public record RosterResponse(
            String tripSlug,
            String tripTitle,
            int capacity,
            int seatsSold,
            int seatsPending,
            int seatsAvailable,
            int incomplete,
            BigDecimal balanceDue,
            List<ParticipantResponse> participants) {}
}
