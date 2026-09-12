package pl.czulapodroz.api.order.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.auth.CurrentUserProvider;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.order.ReservationService;
import pl.czulapodroz.api.order.web.dto.OrderDtos;

/**
 * „Moja rezerwacja" — miejsce, w którym klientka widzi wszystko o swoim wyjeździe.
 *
 * Dostęp bez logowania po tokenie z linku (nagłówek `X-Reservation-Token`
 * albo parametr `token`), a dla zalogowanych po prostu po koncie.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Rezerwacje", description = "Podgląd rezerwacji i szczegółów wyjazdu")
public class ReservationController {

    private final ReservationService reservationService;
    private final CurrentUserProvider currentUserProvider;

    public ReservationController(
            ReservationService reservationService, CurrentUserProvider currentUserProvider) {
        this.reservationService = reservationService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/reservations/{orderNumber}")
    @Operation(summary = "Rezerwacja wraz z pełnymi szczegółami wyjazdu")
    public OrderDtos.ReservationResponse get(
            @PathVariable String orderNumber,
            @RequestParam(name = "token", required = false) String tokenParam,
            @RequestHeader(name = "X-Reservation-Token", required = false) String tokenHeader) {

        String token = tokenHeader != null ? tokenHeader : tokenParam;
        if (token != null && !token.isBlank()) {
            return reservationService.getByToken(orderNumber, token);
        }
        return currentUserProvider
                .currentUserId()
                .map(userId -> reservationService.getForUser(orderNumber, userId))
                .orElseThrow(
                        () ->
                                new BadRequestException(
                                        "reservation.tokenRequired",
                                        "Podaj token z linku do rezerwacji albo zaloguj się"));
    }

    @GetMapping("/me/reservations")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Lista rezerwacji zalogowanej klientki")
    public List<OrderDtos.OrderResponse> myReservations() {
        return reservationService.listForUser(currentUserProvider.requireCurrentUser().getId());
    }
}
