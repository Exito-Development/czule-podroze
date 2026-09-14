package pl.czulapodroz.api.cart.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Kontrakty koszyka „Mój wyjazd". */
public final class CartDtos {

    private CartDtos() {}

    /**
     * @param tripSlug    wyjazd, np. `tajlandia-bali`
     * @param seats       liczba miejsc (osób)
     * @param paymentMode `DEPOSIT` albo `FULL`
     */
    public record AddItemRequest(
            @NotBlank String tripSlug,
            @Min(1) @Max(10) int seats,
            String paymentMode) {}

    public record UpdateItemRequest(@Min(1) @Max(10) int seats, String paymentMode) {}

    /**
     * Koszyk z aktualną dostępnością — frontend odświeża go przy każdym otwarciu
     * szuflady, więc klientka zawsze widzi, czy miejsce wciąż na nią czeka.
     *
     * @param totalDueNow   suma do zapłaty teraz (zadatki lub całości)
     * @param totalTripValue pełna wartość wyjazdów w koszyku
     * @param holdExpiresAt najwcześniejszy moment wygaśnięcia blokady miejsc
     */
    public record CartResponse(
            String id,
            String status,
            List<CartItemResponse> items,
            BigDecimal totalDueNow,
            BigDecimal totalTripValue,
            Instant holdExpiresAt) {}

    /**
     * @param seatsAvailable ile miejsc można jeszcze dokupić poza tą pozycją
     * @param holdActive     czy miejsca są wciąż zablokowane dla tego koszyka
     */
    public record CartItemResponse(
            String id,
            String tripSlug,
            String tripTitle,
            String coverImage,
            int seats,
            String paymentMode,
            BigDecimal unitPrice,
            BigDecimal depositPerSeat,
            BigDecimal amountDueNow,
            BigDecimal tripTotal,
            int seatsAvailable,
            boolean holdActive,
            Instant holdExpiresAt) {}
}
