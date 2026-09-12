package pl.czulapodroz.api.payment.web;

import io.swagger.v3.oas.annotations.Hidden;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;
import pl.czulapodroz.api.payment.PaymentService;
import pl.czulapodroz.api.payment.web.dto.PaymentDtos;

/**
 * Atrapa strony operatora płatności — działa tylko przy `czula.payments.provider=mock`.
 *
 * Zastępuje prawdziwą bramkę na czas developmentu: pokazuje kwotę i pozwala
 * wpłatę potwierdzić albo odrzucić, a potem wraca na stronę rezerwacji —
 * dokładnie tak, jak zrobi to Przelewy24. Dzięki temu cała ścieżka zakupu
 * jest przeklikalna lokalnie, bez żadnych kluczy do zewnętrznego systemu.
 */
@RestController
@RequestMapping("/api/v1/payments/mock")
@ConditionalOnProperty(name = "czula.payments.provider", havingValue = "mock", matchIfMissing = true)
@Hidden
public class MockPaymentController {

    private final PaymentService paymentService;

    public MockPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/{externalId}")
    public ResponseEntity<String> page(
            @PathVariable String externalId, @RequestParam String returnUrl) {
        PaymentDtos.PaymentSessionResponse payment = paymentService.get(externalId);
        String safeId = HtmlUtils.htmlEscape(externalId);
        String safeReturn = HtmlUtils.htmlEscape(returnUrl);

        String html =
                """
                <!doctype html>
                <html lang="pl">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Płatność testowa — Czuła Podróż</title>
                  <style>
                    body { font-family: system-ui, sans-serif; background: #faf6ef; color: #3a342c;
                           display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1rem; }
                    .card { background: #fff; border-radius: 1.5rem; padding: 2.5rem; max-width: 26rem;
                            box-shadow: 0 20px 60px rgba(58,52,44,.12); }
                    h1 { font-size: 1.4rem; margin: 0 0 .25rem; }
                    p { color: #6b6356; line-height: 1.5; }
                    .amount { font-size: 2rem; margin: 1.25rem 0; }
                    button { border: 0; border-radius: 999px; padding: .9rem 1.5rem; font-size: 1rem;
                             cursor: pointer; width: 100%%; margin-top: .6rem; }
                    .pay { background: #9aa886; color: #faf6ef; }
                    .cancel { background: transparent; color: #6b6356; border: 1px solid rgba(58,52,44,.2); }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <h1>Płatność testowa</h1>
                    <p>To atrapa bramki płatniczej używana w środowisku lokalnym.
                       W produkcji w tym miejscu pojawi się strona operatora.</p>
                    <div class="amount">%s %s</div>
                    <form method="post" action="/api/v1/payments/mock/%s/confirm">
                      <input type="hidden" name="returnUrl" value="%s">
                      <button class="pay" type="submit">Zapłać</button>
                    </form>
                    <form method="post" action="/api/v1/payments/mock/%s/cancel">
                      <input type="hidden" name="returnUrl" value="%s">
                      <button class="cancel" type="submit">Odrzuć płatność</button>
                    </form>
                  </div>
                </body>
                </html>
                """
                        .formatted(
                                payment.amount().toPlainString(),
                                payment.currency(),
                                safeId,
                                safeReturn,
                                safeId,
                                safeReturn);

        return ResponseEntity.ok()
                .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
                .body(html);
    }

    @PostMapping("/{externalId}/confirm")
    public ResponseEntity<Void> confirm(
            @PathVariable String externalId, @RequestParam String returnUrl) {
        paymentService.confirm(externalId);
        return redirect(returnUrl, "oplacone");
    }

    @PostMapping("/{externalId}/cancel")
    public ResponseEntity<Void> cancel(
            @PathVariable String externalId, @RequestParam String returnUrl) {
        paymentService.cancel(externalId);
        return redirect(returnUrl, "anulowane");
    }

    private ResponseEntity<Void> redirect(String returnUrl, String result) {
        String separator = returnUrl.contains("?") ? "&" : "?";
        return ResponseEntity.status(303)
                .location(URI.create(returnUrl + separator + "platnosc=" + result))
                .build();
    }
}
