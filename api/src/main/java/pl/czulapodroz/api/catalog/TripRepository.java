package pl.czulapodroz.api.catalog;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.czulapodroz.api.catalog.domain.Continent;
import pl.czulapodroz.api.catalog.domain.Trip;

public interface TripRepository extends JpaRepository<Trip, UUID> {

    Optional<Trip> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Trip> findByPublishedTrueOrderByStartDateAsc();

    List<Trip> findByPublishedTrueAndContinentOrderByStartDateAsc(Continent continent);

    List<Trip> findAllByOrderByStartDateAsc();

    /**
     * Pobiera wyjazd z blokadą wiersza (SELECT … FOR UPDATE).
     *
     * Każda operacja, która sprawdza i zmienia liczbę miejsc (dodanie do
     * koszyka, złożenie zamówienia, potwierdzenie płatności), musi najpierw
     * zawołać tę metodę. Blokada trzyma się do końca transakcji, więc dwie
     * równoległe klientki nie mogą „zobaczyć" tego samego ostatniego miejsca.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Trip t where t.id = :id")
    Optional<Trip> lockById(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Trip t where t.slug = :slug")
    Optional<Trip> lockBySlug(@Param("slug") String slug);
}
