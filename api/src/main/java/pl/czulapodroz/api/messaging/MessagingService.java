package pl.czulapodroz.api.messaging;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Currency;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripCatalogService;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.error.BadRequestException;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.messaging.domain.DeliveryStatus;
import pl.czulapodroz.api.messaging.domain.MessageAudience;
import pl.czulapodroz.api.messaging.domain.MessageDelivery;
import pl.czulapodroz.api.messaging.domain.TripMessage;
import pl.czulapodroz.api.messaging.web.dto.MessageDtos;
import pl.czulapodroz.api.order.OrderRepository;
import pl.czulapodroz.api.order.domain.OrderStatus;
import pl.czulapodroz.api.participants.ParticipantService;
import pl.czulapodroz.api.waitlist.WaitlistRepository;
import pl.czulapodroz.api.waitlist.domain.WaitlistStatus;

/**
 * Wysyłka wiadomości i powiadomień do uczestniczek wyjazdu.
 *
 * Grupę odbiorczyń wyliczamy w chwili wysyłki — lista uczestniczek zmienia się
 * do ostatniej chwili, więc zapisana z góry szybko byłaby nieprawdziwa.
 * Każde doręczenie zapisujemy osobno: awaria jednego adresu nie przerywa
 * wysyłki do pozostałych, a organizatorki widzą potem, kto informacji nie dostał.
 */
@Service
public class MessagingService {

    private static final Logger log = LoggerFactory.getLogger(MessagingService.class);

    private final TripMessageRepository messageRepository;
    private final MessageSender messageSender;
    private final MessagingProperties properties;
    private final TripCatalogService tripCatalogService;
    private final ParticipantService participantService;
    private final OrderRepository orderRepository;
    private final WaitlistRepository waitlistRepository;
    private final Clock clock;

    public MessagingService(
            TripMessageRepository messageRepository,
            MessageSender messageSender,
            MessagingProperties properties,
            TripCatalogService tripCatalogService,
            ParticipantService participantService,
            OrderRepository orderRepository,
            WaitlistRepository waitlistRepository,
            Clock clock) {
        this.messageRepository = messageRepository;
        this.messageSender = messageSender;
        this.properties = properties;
        this.tripCatalogService = tripCatalogService;
        this.participantService = participantService;
        this.orderRepository = orderRepository;
        this.waitlistRepository = waitlistRepository;
        this.clock = clock;
    }

    /** Jedna odbiorczyni wraz z danymi do personalizacji treści. */
    private record Recipient(
            String name,
            String firstName,
            String email,
            String orderNumber,
            BigDecimal balanceDue) {}

    @Transactional(readOnly = true)
    public List<MessageDtos.AudienceOptionResponse> audiences(String tripSlug) {
        Trip trip = tripCatalogService.requireBySlug(tripSlug);
        List<MessageDtos.AudienceOptionResponse> options = new ArrayList<>();
        for (MessageAudience audience : MessageAudience.values()) {
            options.add(
                    new MessageDtos.AudienceOptionResponse(
                            audience.name(), audience.label(), recipientsFor(trip, audience).size()));
        }
        return options;
    }

    @Transactional(readOnly = true)
    public MessageDtos.RecipientPreviewResponse preview(String tripSlug, String audienceValue) {
        Trip trip = tripCatalogService.requireBySlug(tripSlug);
        MessageAudience audience = parseAudience(audienceValue);
        List<Recipient> recipients = recipientsFor(trip, audience);

        return new MessageDtos.RecipientPreviewResponse(
                audience.name(),
                audience.label(),
                recipients.size(),
                recipients.stream()
                        .map(r -> new MessageDtos.RecipientResponse(r.name(), r.email()))
                        .toList());
    }

    @Transactional
    public MessageDtos.MessageResponse send(
            String tripSlug, MessageDtos.SendMessageRequest request, String sentBy) {
        Trip trip = tripCatalogService.requireBySlug(tripSlug);
        MessageAudience audience = parseAudience(request.audience());
        List<Recipient> recipients = recipientsFor(trip, audience);

        if (recipients.isEmpty()) {
            throw new BadRequestException(
                    "message.noRecipients",
                    "W grupie \u201e%s\u201d nie ma nikogo z adresem e-mail"
                            .formatted(audience.label()));
        }

        TripMessage message =
                new TripMessage(
                        trip,
                        request.subject(),
                        request.body(),
                        audience,
                        sentBy,
                        messageSender.providerName(),
                        clock.instant());

        for (Recipient recipient : recipients) {
            String body = personalize(request.body(), trip, recipient);
            try {
                messageSender.send(
                        new MessageSender.OutgoingMessage(
                                recipient.name(), recipient.email(), request.subject(), body));
                message.addDelivery(
                        new MessageDelivery(
                                message,
                                recipient.name(),
                                recipient.email(),
                                DeliveryStatus.SENT,
                                null));
            } catch (RuntimeException exception) {
                // Jeden zły adres nie może zablokować wysyłki do reszty grupy.
                log.warn("Nie udało się wysłać wiadomości do {}", recipient.email(), exception);
                message.addDelivery(
                        new MessageDelivery(
                                message,
                                recipient.name(),
                                recipient.email(),
                                DeliveryStatus.FAILED,
                                shorten(exception.getMessage())));
            }
        }

        TripMessage saved = messageRepository.save(message);
        log.info(
                "Wys\u0142ano wiadomo\u015b\u0107 \u201e{}\u201d do {} odbiorczy\u0144 "
                        + "wyjazdu {} ({} niepowodze\u0144)",
                request.subject(),
                saved.getRecipientCount(),
                trip.getSlug(),
                saved.getFailedCount());
        return toResponse(saved, true);
    }

    @Transactional(readOnly = true)
    public List<MessageDtos.MessageResponse> history(String tripSlug) {
        Trip trip = tripCatalogService.requireBySlug(tripSlug);
        return messageRepository.findByTripIdOrderBySentAtDesc(trip.getId()).stream()
                .map(message -> toResponse(message, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDtos.MessageResponse> allHistory() {
        return messageRepository.findAllByOrderBySentAtDesc().stream()
                .map(message -> toResponse(message, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public MessageDtos.MessageResponse detail(UUID messageId) {
        TripMessage message =
                messageRepository
                        .findById(messageId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "message.notFound",
                                                "Nie znaleziono wiadomości"));
        return toResponse(message, true);
    }

    private List<Recipient> recipientsFor(Trip trip, MessageAudience audience) {
        List<Recipient> recipients =
                switch (audience) {
                    case PARTICIPANTS -> participantsOf(trip, false);
                    case BALANCE_DUE -> participantsOf(trip, true);
                    case PENDING_PAYMENT -> pendingPayers(trip);
                    case WAITLIST -> waitlist(trip);
                };
        return deduplicate(recipients);
    }

    /**
     * Jedna osoba dostaje wiadomość raz.
     *
     * Ta sama klientka może mieć dwie rezerwacje na ten sam wyjazd (np. dokupiła
     * miejsce dla koleżanki) — bez tego dostałaby dwa identyczne maile.
     */
    private static List<Recipient> deduplicate(List<Recipient> recipients) {
        Set<String> seen = new LinkedHashSet<>();
        List<Recipient> unique = new ArrayList<>();
        for (Recipient recipient : recipients) {
            if (recipient.email() == null || recipient.email().isBlank()) {
                continue;
            }
            if (seen.add(recipient.email().toLowerCase(Locale.ROOT))) {
                unique.add(recipient);
            }
        }
        return unique;
    }

    private List<Recipient> participantsOf(Trip trip, boolean onlyWithBalance) {
        return participantService.confirmedWithEmail(trip.getId()).stream()
                .filter(
                        participant ->
                                !onlyWithBalance
                                        || (participant.isContactPerson()
                                                && participant.getOrder().balanceDue().signum() > 0))
                .map(
                        participant ->
                                new Recipient(
                                        participant.displayName(),
                                        participant.getFirstName(),
                                        participant.getEmail(),
                                        participant.getOrder().getOrderNumber(),
                                        participant.getOrder().balanceDue()))
                .toList();
    }

    private List<Recipient> pendingPayers(Trip trip) {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                .filter(
                        order ->
                                order.getItems().stream()
                                        .anyMatch(
                                                item ->
                                                        item.getTrip()
                                                                .getId()
                                                                .equals(trip.getId())))
                .map(
                        order ->
                                new Recipient(
                                        order.getCustomer().fullName(),
                                        order.getCustomer().getFirstName(),
                                        order.getCustomer().getEmail(),
                                        order.getOrderNumber(),
                                        order.getAmountDueNow()))
                .toList();
    }

    private List<Recipient> waitlist(Trip trip) {
        return waitlistRepository.findByTripIdOrderByCreatedAtAsc(trip.getId()).stream()
                .filter(entry -> entry.getStatus() != WaitlistStatus.CANCELLED)
                .map(
                        entry ->
                                new Recipient(
                                        entry.getName(),
                                        firstWord(entry.getName()),
                                        entry.getEmail(),
                                        null,
                                        null))
                .toList();
    }

    /**
     * Podstawienia w treści.
     *
     * Świadomie proste i po polsku — organizatorki piszą wiadomości same,
     * bez znajomości żadnej składni szablonów.
     */
    private String personalize(String body, Trip trip, Recipient recipient) {
        String personalized =
                body.replace("{{imie}}", nullToEmpty(recipient.firstName()))
                        .replace("{{wyjazd}}", trip.getTitle())
                        .replace("{{numer_rezerwacji}}", nullToEmpty(recipient.orderNumber()))
                        .replace(
                                "{{do_doplaty}}",
                                recipient.balanceDue() == null
                                        ? ""
                                        : formatPrice(recipient.balanceDue()));
        return personalized + "\n\n" + properties.signature();
    }

    private MessageAudience parseAudience(String value) {
        try {
            return MessageAudience.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "message.unknownAudience", "Nieznana grupa odbiorczyń: " + value);
        }
    }

    private static MessageDtos.MessageResponse toResponse(
            TripMessage message, boolean withDeliveries) {
        return new MessageDtos.MessageResponse(
                message.getId().toString(),
                message.getTrip().getSlug(),
                message.getTrip().getTitle(),
                message.getSubject(),
                message.getBody(),
                message.getAudience().name(),
                message.getAudience().label(),
                message.getSentBy(),
                message.getSentAt(),
                message.getRecipientCount(),
                message.getFailedCount(),
                message.getProvider(),
                withDeliveries
                        ? message.getDeliveries().stream()
                                .map(
                                        delivery ->
                                                new MessageDtos.DeliveryResponse(
                                                        delivery.getRecipientName(),
                                                        delivery.getRecipientEmail(),
                                                        delivery.getStatus().name(),
                                                        delivery.getFailureReason()))
                                .toList()
                        : List.of());
    }

    private static String formatPrice(BigDecimal amount) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.of("pl", "PL"));
        format.setCurrency(Currency.getInstance("PLN"));
        format.setMaximumFractionDigits(0);
        return format.format(amount);
    }

    private static String firstWord(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim().split("\\s+")[0];
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String shorten(String value) {
        if (value == null) {
            return "Nieznany błąd";
        }
        return value.length() <= 500 ? value : value.substring(0, 497) + "…";
    }
}
