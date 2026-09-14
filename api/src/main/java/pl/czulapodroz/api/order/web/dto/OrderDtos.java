package pl.czulapodroz.api.order.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import pl.czulapodroz.api.catalog.web.dto.TripResponse;

/** Kontrakty zamówień i podglądu rezerwacji. */
public final class OrderDtos {

    private OrderDtos() {}

    public record CustomerRequest(
            @NotBlank @Size(max = 120) String firstName,
            @NotBlank @Size(max = 120) String lastName,
            @NotBlank @Email @Size(max = 320) String email,
            @Size(max = 40) String phone,
            @Size(max = 2000) String note) {}

    /**
     * @param acceptTerms zgoda na regulamin — bez niej nie zawieramy umowy
     */
    public record PlaceOrderRequest(
            @NotNull UUID cartId,
            @NotNull @Valid CustomerRequest customer,
            @AssertTrue(message = "Akceptacja regulaminu jest wymagana") boolean acceptTerms) {}

    /**
     * Odpowiedź po złożeniu zamówienia.
     *
     * `accessToken` pojawia się TYLKO tutaj — to jedyny moment, w którym
     * pokazujemy go w czystej postaci. Frontend zapisuje go u siebie i używa
     * do podglądu rezerwacji bez logowania.
     */
    public record PlacedOrderResponse(
            OrderResponse order, String accessToken, String reservationUrl) {}

    public record OrderResponse(
            String orderNumber,
            String status,
            String currency,
            BigDecimal amountDueNow,
            BigDecimal amountPaid,
            BigDecimal tripTotal,
            BigDecimal balanceDue,
            Instant paymentDeadline,
            Instant paidAt,
            Instant createdAt,
            CustomerResponse customer,
            List<OrderItemResponse> items) {}

    public record CustomerResponse(
            String firstName, String lastName, String email, String phone, String note) {}

    public record OrderItemResponse(
            String tripSlug,
            String tripTitle,
            int seats,
            String paymentMode,
            BigDecimal unitPrice,
            BigDecimal depositPerSeat,
            BigDecimal amountDueNow,
            BigDecimal tripTotal,
            BigDecimal balanceDue) {}

    /**
     * Pełen widok rezerwacji — to, co klientka dostaje po opłaceniu.
     *
     * Oprócz danych zamówienia zawiera komplet informacji o wyjazdach:
     * plan dzień po dniu, destynacje i listę „co w cenie", żeby wszystko
     * dało się pobrać z jednego miejsca.
     */
    public record ReservationResponse(OrderResponse order, List<TripResponse> trips) {}
}
