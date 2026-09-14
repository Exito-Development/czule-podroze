package pl.czulapodroz.api.order.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.auth.CurrentUserProvider;
import pl.czulapodroz.api.order.OrderService;
import pl.czulapodroz.api.order.web.dto.OrderDtos;

/** Składanie zamówienia na wyjazd. */
@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Zamówienia", description = "Zamiana koszyka na rezerwację")
public class OrderController {

    private final OrderService orderService;
    private final CurrentUserProvider currentUserProvider;

    public OrderController(OrderService orderService, CurrentUserProvider currentUserProvider) {
        this.orderService = orderService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    @Operation(
            summary = "Składa zamówienie z koszyka",
            description =
                    "Potwierdza blokady miejsc, zamraża ceny i zwraca token dostępu "
                            + "do rezerwacji. Token pokazujemy tylko w tej odpowiedzi.")
    public ResponseEntity<OrderDtos.PlacedOrderResponse> place(
            @Valid @RequestBody OrderDtos.PlaceOrderRequest request) {
        OrderDtos.PlacedOrderResponse placed =
                orderService.placeOrder(request, currentUserProvider.currentUserId().orElse(null));
        return ResponseEntity.created(
                        URI.create("/api/v1/reservations/" + placed.order().orderNumber()))
                .body(placed);
    }
}
