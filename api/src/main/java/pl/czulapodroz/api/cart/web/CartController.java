package pl.czulapodroz.api.cart.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.auth.CurrentUserProvider;
import pl.czulapodroz.api.cart.CartService;
import pl.czulapodroz.api.cart.web.dto.CartDtos;

/**
 * Koszyk „Mój wyjazd".
 *
 * Identyfikator koszyka frontend trzyma w `localStorage` — dzięki temu
 * rezerwacja działa bez logowania, a po zalogowaniu koszyk zostaje przypisany
 * do konta.
 */
@RestController
@RequestMapping("/api/v1/carts")
@Tag(name = "Koszyk", description = "Koszyk z blokadą miejsc na czas zakupów")
public class CartController {

    private final CartService cartService;
    private final CurrentUserProvider currentUserProvider;

    public CartController(CartService cartService, CurrentUserProvider currentUserProvider) {
        this.cartService = cartService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    @Operation(summary = "Tworzy nowy koszyk")
    public ResponseEntity<CartDtos.CartResponse> create() {
        CartDtos.CartResponse cart =
                cartService.createCart(currentUserProvider.currentUserId().orElse(null));
        return ResponseEntity.created(URI.create("/api/v1/carts/" + cart.id())).body(cart);
    }

    @GetMapping("/{cartId}")
    @Operation(summary = "Zawartość koszyka wraz z aktualną dostępnością miejsc")
    public CartDtos.CartResponse get(@PathVariable UUID cartId) {
        return cartService.getCart(cartId);
    }

    @PostMapping("/{cartId}/items")
    @Operation(
            summary = "Dodaje wyjazd do koszyka i blokuje miejsca",
            description =
                    "Jeżeli wyjazd jest już w koszyku, pozycja zostaje nadpisana nową liczbą miejsc.")
    public CartDtos.CartResponse addItem(
            @PathVariable UUID cartId, @Valid @RequestBody CartDtos.AddItemRequest request) {
        return cartService.addItem(cartId, request);
    }

    @PatchMapping("/{cartId}/items/{itemId}")
    @Operation(summary = "Zmienia liczbę miejsc lub sposób płatności")
    public CartDtos.CartResponse updateItem(
            @PathVariable UUID cartId,
            @PathVariable UUID itemId,
            @Valid @RequestBody CartDtos.UpdateItemRequest request) {
        return cartService.updateItem(cartId, itemId, request);
    }

    @DeleteMapping("/{cartId}/items/{itemId}")
    @Operation(summary = "Usuwa wyjazd z koszyka i zwalnia miejsca")
    public CartDtos.CartResponse removeItem(
            @PathVariable UUID cartId, @PathVariable UUID itemId) {
        return cartService.removeItem(cartId, itemId);
    }

    @PostMapping("/{cartId}/refresh")
    @Operation(summary = "Odnawia blokady miejsc przed przejściem do płatności")
    public CartDtos.CartResponse refresh(@PathVariable UUID cartId) {
        return cartService.refreshHolds(cartId);
    }
}
