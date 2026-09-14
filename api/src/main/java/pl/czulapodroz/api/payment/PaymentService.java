package pl.czulapodroz.api.payment;

import java.time.Clock;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.common.config.FrontendProperties;
import pl.czulapodroz.api.common.error.ConflictException;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.common.util.SecureTokens;
import pl.czulapodroz.api.order.OrderPaymentService;
import pl.czulapodroz.api.order.OrderRepository;
import pl.czulapodroz.api.order.domain.TripOrder;
import pl.czulapodroz.api.payment.domain.Payment;
import pl.czulapodroz.api.payment.web.dto.PaymentDtos;

/**
 * Obsługa płatności za zamówienie.
 *
 * Moduł nie zna reguł rezerwacji miejsc — po potwierdzeniu wpłaty woła
 * {@link OrderPaymentService}, który domyka zamówienie i zamienia blokady
 * w miejsca zajęte. Potwierdzenia są idempotentne, bo operatorzy potrafią
 * wysłać to samo powiadomienie kilka razy.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderPaymentService orderPaymentService;
    private final PaymentGateway paymentGateway;
    private final FrontendProperties frontendProperties;
    private final Clock clock;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            OrderPaymentService orderPaymentService,
            PaymentGateway paymentGateway,
            FrontendProperties frontendProperties,
            Clock clock) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderPaymentService = orderPaymentService;
        this.paymentGateway = paymentGateway;
        this.frontendProperties = frontendProperties;
        this.clock = clock;
    }

    @Transactional
    public PaymentDtos.PaymentSessionResponse startPayment(
            PaymentDtos.StartPaymentRequest request) {
        TripOrder order =
                orderRepository
                        .findByOrderNumber(request.orderNumber())
                        .filter(
                                candidate ->
                                        SecureTokens.matches(
                                                request.accessToken(),
                                                candidate.getAccessTokenHash()))
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "order.notFound",
                                                "Nie znaleziono zamówienia o podanym numerze i tokenie"));

        if (order.isPaid()) {
            throw new ConflictException("order.alreadyPaid", "To zamówienie jest już opłacone");
        }
        if (!order.awaitsPayment()) {
            throw new ConflictException(
                    "order.notPayable",
                    "Zamówienie nie oczekuje na płatność (status: %s)".formatted(order.getStatus()));
        }
        if (order.getPaymentDeadline().isBefore(clock.instant())) {
            throw new ConflictException(
                    "order.paymentExpired",
                    "Czas na opłacenie zamówienia minął — złóż je ponownie");
        }

        // Ponowne kliknięcie „Zapłać" nie tworzy drugiej transakcji.
        Optional<Payment> pending =
                paymentRepository.findByOrderIdOrderByCreatedAtDesc(order.getId()).stream()
                        .filter(Payment::isPending)
                        .findFirst();
        if (pending.isPresent()) {
            return toResponse(pending.get());
        }

        PaymentGateway.PaymentSession session =
                paymentGateway.createSession(
                        new PaymentGateway.PaymentSessionRequest(
                                order.getOrderNumber(),
                                order.getAmountDueNow(),
                                order.getCurrency(),
                                order.getCustomer().getEmail(),
                                "Czuła Podróż — zamówienie " + order.getOrderNumber(),
                                frontendProperties.baseUrl()
                                        + "/rezerwacja/"
                                        + order.getOrderNumber()));

        Payment payment =
                paymentRepository.save(
                        new Payment(
                                order,
                                paymentGateway.providerName(),
                                session.externalId(),
                                order.getAmountDueNow(),
                                order.getCurrency(),
                                session.redirectUrl()));

        log.info(
                "Utworzono sesję płatności {} dla zamówienia {}",
                payment.getExternalId(),
                order.getOrderNumber());
        return toResponse(payment);
    }

    @Transactional
    public void confirm(String externalId) {
        Payment payment = requirePayment(externalId);
        if (!payment.isPending()) {
            log.info("Płatność {} już rozliczona — pomijam", externalId);
            return;
        }
        payment.succeed(clock.instant());
        paymentRepository.save(payment);
        orderPaymentService.confirmPayment(payment.getOrder().getId(), payment.getAmount());
    }

    @Transactional
    public void fail(String externalId, String reason) {
        Payment payment = requirePayment(externalId);
        if (payment.isPending()) {
            payment.fail(clock.instant(), reason);
            paymentRepository.save(payment);
        }
    }

    @Transactional
    public void cancel(String externalId) {
        Payment payment = requirePayment(externalId);
        if (payment.isPending()) {
            payment.cancel(clock.instant());
            paymentRepository.save(payment);
        }
    }

    @Transactional(readOnly = true)
    public PaymentDtos.PaymentSessionResponse get(String externalId) {
        return toResponse(requirePayment(externalId));
    }

    private Payment requirePayment(String externalId) {
        return paymentRepository
                .findByExternalId(externalId)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "payment.notFound", "Nie znaleziono płatności"));
    }

    private PaymentDtos.PaymentSessionResponse toResponse(Payment payment) {
        return new PaymentDtos.PaymentSessionResponse(
                payment.getExternalId(),
                payment.getProvider(),
                payment.getStatus().name(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getRedirectUrl());
    }
}
