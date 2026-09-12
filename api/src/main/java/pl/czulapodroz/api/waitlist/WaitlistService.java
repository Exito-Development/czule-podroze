package pl.czulapodroz.api.waitlist;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.czulapodroz.api.catalog.TripCatalogService;
import pl.czulapodroz.api.catalog.domain.Trip;
import pl.czulapodroz.api.waitlist.domain.WaitlistEntry;
import pl.czulapodroz.api.waitlist.web.dto.WaitlistDtos;

/**
 * Lista rezerwowa.
 *
 * Zapis jest idempotentny po parze (wyjazd, e-mail) — powtórne wysłanie
 * formularza aktualizuje kontakt zamiast tworzyć duplikat i nie przesuwa
 * klientki na koniec kolejki.
 */
@Service
public class WaitlistService {

    private static final Logger log = LoggerFactory.getLogger(WaitlistService.class);

    private final WaitlistRepository waitlistRepository;
    private final TripCatalogService tripCatalogService;

    public WaitlistService(
            WaitlistRepository waitlistRepository, TripCatalogService tripCatalogService) {
        this.waitlistRepository = waitlistRepository;
        this.tripCatalogService = tripCatalogService;
    }

    @Transactional
    public WaitlistDtos.WaitlistEntryResponse join(WaitlistDtos.JoinRequest request) {
        Trip trip = tripCatalogService.requireBySlug(request.tripSlug());
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        WaitlistEntry entry =
                waitlistRepository
                        .findByTripIdAndEmail(trip.getId(), email)
                        .map(
                                existing -> {
                                    existing.refreshContact(request.name(), request.phone());
                                    return existing;
                                })
                        .orElseGet(
                                () ->
                                        new WaitlistEntry(
                                                trip, request.name(), email, request.phone()));

        WaitlistEntry saved = waitlistRepository.save(entry);
        log.info("Zapis na listę rezerwową wyjazdu {}", trip.getSlug());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WaitlistDtos.WaitlistEntryResponse> listForTrip(String tripSlug) {
        Trip trip = tripCatalogService.requireBySlug(tripSlug);
        return waitlistRepository.findByTripIdOrderByCreatedAtAsc(trip.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WaitlistDtos.WaitlistEntryResponse> listAll() {
        return waitlistRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private WaitlistDtos.WaitlistEntryResponse toResponse(WaitlistEntry entry) {
        return new WaitlistDtos.WaitlistEntryResponse(
                entry.getId().toString(),
                entry.getTrip().getSlug(),
                entry.getTrip().getTitle(),
                entry.getName(),
                entry.getEmail(),
                entry.getPhone(),
                entry.getStatus().name(),
                positionOf(entry),
                entry.getCreatedAt());
    }

    /** Numer w kolejce liczony po dacie zgłoszenia. */
    private int positionOf(WaitlistEntry entry) {
        UUID tripId = entry.getTrip().getId();
        List<WaitlistEntry> queue = waitlistRepository.findByTripIdOrderByCreatedAtAsc(tripId);
        for (int index = 0; index < queue.size(); index++) {
            if (queue.get(index).getId().equals(entry.getId())) {
                return index + 1;
            }
        }
        return queue.size() + 1;
    }
}
