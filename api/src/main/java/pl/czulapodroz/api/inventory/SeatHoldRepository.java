package pl.czulapodroz.api.inventory;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.czulapodroz.api.inventory.domain.SeatHold;
import pl.czulapodroz.api.inventory.domain.SeatHoldStatus;

public interface SeatHoldRepository extends JpaRepository<SeatHold, UUID> {

    Optional<SeatHold> findByCartIdAndTripId(UUID cartId, UUID tripId);

    List<SeatHold> findByCartId(UUID cartId);

    List<SeatHold> findByOrderId(UUID orderId);

    /** Suma miejsc trzymanych aktualnie przez wszystkie koszyki dla wyjazdu. */
    @Query(
            """
            select coalesce(sum(h.seats), 0)
            from SeatHold h
            where h.trip.id = :tripId
              and h.status = pl.czulapodroz.api.inventory.domain.SeatHoldStatus.ACTIVE
              and h.expiresAt > :now
            """)
    int sumActiveSeats(@Param("tripId") UUID tripId, @Param("now") Instant now);

    /** Jak wyżej, ale bez blokady należącej do wskazanego koszyka. */
    @Query(
            """
            select coalesce(sum(h.seats), 0)
            from SeatHold h
            where h.trip.id = :tripId
              and h.cartId <> :cartId
              and h.status = pl.czulapodroz.api.inventory.domain.SeatHoldStatus.ACTIVE
              and h.expiresAt > :now
            """)
    int sumActiveSeatsExcludingCart(
            @Param("tripId") UUID tripId, @Param("cartId") UUID cartId, @Param("now") Instant now);

    @Query(
            """
            select h.trip.id as tripId, coalesce(sum(h.seats), 0) as seats
            from SeatHold h
            where h.trip.id in :tripIds
              and h.status = pl.czulapodroz.api.inventory.domain.SeatHoldStatus.ACTIVE
              and h.expiresAt > :now
            group by h.trip.id
            """)
    List<HeldSeatsByTrip> sumActiveSeatsByTrip(
            @Param("tripIds") Collection<UUID> tripIds, @Param("now") Instant now);

    /** Projekcja dla zbiorczego odpytania o zajętość wielu wyjazdów naraz. */
    interface HeldSeatsByTrip {
        UUID getTripId();

        int getSeats();
    }

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            """
            update SeatHold h
            set h.status = pl.czulapodroz.api.inventory.domain.SeatHoldStatus.EXPIRED
            where h.status = pl.czulapodroz.api.inventory.domain.SeatHoldStatus.ACTIVE
              and h.expiresAt <= :now
            """)
    int expireOutdated(@Param("now") Instant now);

    List<SeatHold> findByStatusAndExpiresAtBefore(SeatHoldStatus status, Instant moment);
}
