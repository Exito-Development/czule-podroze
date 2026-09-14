package pl.czulapodroz.api.participants;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripCatalogService;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.common.error.NotFoundException;
import pl.czulapodroz.api.inventory.SeatAvailability;
import pl.czulapodroz.api.inventory.SeatAvailabilityService;
import pl.czulapodroz.api.order.OrderConfirmedEvent;
import pl.czulapodroz.api.order.OrderRepository;
import pl.czulapodroz.api.order.domain.OrderItem;
import pl.czulapodroz.api.order.domain.OrderStatus;
import pl.czulapodroz.api.order.domain.TripOrder;
import pl.czulapodroz.api.participants.domain.Participant;
import pl.czulapodroz.api.participants.domain.ParticipantStatus;
import pl.czulapodroz.api.participants.web.dto.ParticipantDtos;

/**
 * Lista uczestniczek wyjazdu.
 *
 * Wiersze powstają automatycznie po opłaceniu zamówienia (nasłuch
 * {@link OrderConfirmedEvent}) — po jednym na każde kupione miejsce. Dane zna
 * tylko osoba rezerwująca, więc pozostałe miejsca czekają na uzupełnienie
 * w panelu.
 *
 * {@link #ensureRoster} jest idempotentne i wołane także przy odczycie listy:
 * dzięki temu zamówienia opłacone zanim ten moduł powstał również mają swoją
 * listę, bez ręcznej migracji danych.
 */
@Service
public class ParticipantService {

    private static final Logger log = LoggerFactory.getLogger(ParticipantService.class);

    private final ParticipantRepository participantRepository;
    private final OrderRepository orderRepository;
    private final TripCatalogService tripCatalogService;
    private final SeatAvailabilityService seatAvailabilityService;

    public ParticipantService(
            ParticipantRepository participantRepository,
            OrderRepository orderRepository,
            TripCatalogService tripCatalogService,
            SeatAvailabilityService seatAvailabilityService) {
        this.participantRepository = participantRepository;
        this.orderRepository = orderRepository;
        this.tripCatalogService = tripCatalogService;
        this.seatAvailabilityService = seatAvailabilityService;
    }

    @EventListener
    @Transactional
    public void onOrderConfirmed(OrderConfirmedEvent event) {
        orderRepository.findById(event.orderId()).ifPresent(this::ensureRosterFor);
        log.debug("Uzupełniono listę uczestniczek dla zamówienia {}", event.orderNumber());
    }

    /** Tworzy brakujące miejsca dla opłaconego zamówienia. Wołanie wielokrotne jest bezpieczne. */
    @Transactional
    public void ensureRosterFor(TripOrder order) {
        if (!order.isPaid()) {
            return;
        }
        for (OrderItem item : order.getItems()) {
            Set<Integer> existing = new HashSet<>();
            participantRepository
                    .findByOrderItemId(item.getId())
                    .forEach(participant -> existing.add(participant.getSeatNumber()));

            List<Participant> created = new ArrayList<>();
            for (int seat = 1; seat <= item.getSeats(); seat++) {
                if (existing.contains(seat)) {
                    continue;
                }
                boolean isBooker = seat == 1;
                Participant participant =
                        new Participant(item.getTrip(), order, item.getId(), seat, isBooker);
                if (isBooker) {
                    // Pierwsze miejsce zawsze należy do osoby rezerwującej — jej dane znamy.
                    participant.updateDetails(
                            order.getCustomer().getFirstName(),
                            order.getCustomer().getLastName(),
                            order.getCustomer().getEmail(),
                            order.getCustomer().getPhone(),
                            order.getCustomer().getNote());
                }
                created.add(participant);
            }
            participantRepository.saveAll(created);
        }
    }

    /** Lista uczestniczek wyjazdu wraz z podsumowaniem. */
    @Transactional
    public ParticipantDtos.RosterResponse roster(String tripSlug) {
        Trip trip = tripCatalogService.requireBySlug(tripSlug);

        // Uzupełnienie listy o zamówienia opłacone przed powstaniem tego modułu.
        orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(TripOrder::isPaid)
                .filter(order -> containsTrip(order, trip))
                .forEach(this::ensureRosterFor);

        List<Participant> participants = participantRepository.findForTrip(trip.getId());
        SeatAvailability availability = seatAvailabilityService.availabilityFor(trip);

        int seatsPending =
                orderRepository.findAllByOrderByCreatedAtDesc().stream()
                        .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                        .flatMap(order -> order.getItems().stream())
                        .filter(item -> item.getTrip().getId().equals(trip.getId()))
                        .mapToInt(OrderItem::getSeats)
                        .sum();

        BigDecimal balanceDue =
                participants.stream()
                        .filter(Participant::isContactPerson)
                        .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                        .map(p -> p.getOrder().balanceDue())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        int incomplete =
                (int)
                        participants.stream()
                                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                                .filter(Participant::isIncomplete)
                                .count();

        return new ParticipantDtos.RosterResponse(
                trip.getSlug(),
                trip.getTitle(),
                trip.getCapacity(),
                trip.getBookedSeats(),
                seatsPending,
                availability.available(),
                incomplete,
                balanceDue,
                participants.stream().map(ParticipantService::toResponse).toList());
    }

    @Transactional
    public ParticipantDtos.ParticipantResponse update(
            UUID participantId, ParticipantDtos.UpdateParticipantRequest request) {
        Participant participant = require(participantId);
        participant.updateDetails(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.note());
        return toResponse(participantRepository.save(participant));
    }

    @Transactional
    public ParticipantDtos.ParticipantResponse cancel(UUID participantId) {
        Participant participant = require(participantId);
        participant.cancel();
        return toResponse(participantRepository.save(participant));
    }

    @Transactional
    public ParticipantDtos.ParticipantResponse restore(UUID participantId) {
        Participant participant = require(participantId);
        participant.restore();
        return toResponse(participantRepository.save(participant));
    }

    /** Lista w formacie do arkusza — organizatorki drukują ją przed wyjazdem. */
    @Transactional
    public String csv(String tripSlug) {
        ParticipantDtos.RosterResponse roster = roster(tripSlug);
        StringBuilder csv = new StringBuilder();
        csv.append("Imię,Nazwisko,E-mail,Telefon,Uwagi,Zamówienie,Status,Do dopłaty\n");
        for (ParticipantDtos.ParticipantResponse participant : roster.participants()) {
            csv.append(
                    String.join(
                            ",",
                            quote(participant.firstName()),
                            quote(participant.lastName()),
                            quote(participant.email()),
                            quote(participant.phone()),
                            quote(participant.note()),
                            quote(participant.orderNumber()),
                            quote(participant.status()),
                            quote(
                                    participant.balanceDue() == null
                                            ? ""
                                            : participant.balanceDue().toPlainString())));
            csv.append("\n");
        }
        return csv.toString();
    }

    /** Uczestniczki wyjazdu z adresem e-mail — odbiorczynie wiadomości. */
    @Transactional(readOnly = true)
    public List<Participant> confirmedWithEmail(UUID tripId) {
        return participantRepository.findForTrip(tripId).stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                .filter(Participant::hasEmail)
                .toList();
    }

    private Participant require(UUID participantId) {
        return participantRepository
                .findById(participantId)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "participant.notFound", "Nie znaleziono uczestniczki"));
    }

    private static boolean containsTrip(TripOrder order, Trip trip) {
        return order.getItems().stream()
                .anyMatch(item -> item.getTrip().getId().equals(trip.getId()));
    }

    private static String quote(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return "\"" + safe + "\"";
    }

    static ParticipantDtos.ParticipantResponse toResponse(Participant participant) {
        TripOrder order = participant.getOrder();
        return new ParticipantDtos.ParticipantResponse(
                participant.getId().toString(),
                participant.displayName(),
                participant.getFirstName(),
                participant.getLastName(),
                participant.getEmail(),
                participant.getPhone(),
                participant.getNote(),
                participant.isContactPerson(),
                participant.isIncomplete(),
                participant.getStatus().name(),
                participant.getSeatNumber(),
                order.getOrderNumber(),
                order.getStatus().name(),
                order.getItems().stream()
                        .filter(item -> item.getId().equals(participant.getOrderItemId()))
                        .findFirst()
                        .map(item -> item.getPaymentMode().name())
                        .orElse(null),
                order.balanceDue(),
                order.getCustomer().fullName(),
                order.getCustomer().getEmail());
    }
}
