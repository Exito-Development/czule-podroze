package pl.czulapodroz.api.order.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.order.OrderPaymentService;
import pl.czulapodroz.api.order.OrderService;
import pl.czulapodroz.api.order.web.dto.OrderDtos;

/** Podgląd i obsługa zamówień przez organizatorki. */
@RestController
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administracja")
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderPaymentService orderPaymentService;

    public AdminOrderController(
            OrderService orderService, OrderPaymentService orderPaymentService) {
        this.orderService = orderService;
        this.orderPaymentService = orderPaymentService;
    }

    /**
     * Ręczne zaksięgowanie wpłaty.
     *
     * @param amount kwota; pominięta oznacza całą kwotę do zapłaty z zamówienia
     */
    public record MarkPaidRequest(@DecimalMin("0.00") BigDecimal amount) {}

    @GetMapping
    @Operation(summary = "Wszystkie zamówienia, od najnowszych")
    public List<OrderDtos.OrderResponse> list() {
        return orderService.listAll();
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Szczegóły zamówienia")
    public OrderDtos.OrderResponse get(@PathVariable String orderNumber) {
        return orderService.detail(orderNumber);
    }

    @PostMapping("/{orderNumber}/mark-paid")
    @Operation(
            summary = "Księguje wpłatę spoza bramki (np. przelew tradycyjny)",
            description =
                    "Ta sama ścieżka co płatność online: miejsca zostają przyznane, "
                            + "a lista uczestniczek uzupełniona.")
    public OrderDtos.OrderResponse markPaid(
            @PathVariable String orderNumber, @Valid @RequestBody(required = false) MarkPaidRequest request) {
        orderPaymentService.recordOfflinePayment(
                orderNumber, request == null ? null : request.amount());
        return orderService.detail(orderNumber);
    }

    @PostMapping("/{orderNumber}/cancel")
    @Operation(summary = "Anuluje nieopłacone zamówienie i zwalnia miejsca")
    public ResponseEntity<Void> cancel(@PathVariable String orderNumber) {
        orderPaymentService.cancel(orderNumber);
        return ResponseEntity.noContent().build();
    }
}
