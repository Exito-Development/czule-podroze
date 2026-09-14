package pl.czulapodroz.api.catalog.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import pl.czulapodroz.api.common.domain.BaseEntity;

/**
 * Wyjazd — korzeń agregatu katalogu.
 *
 * Encja pilnuje własnych niezmienników: liczba zajętych miejsc nigdy nie
 * przekracza pojemności, a plan i destynacje są zawsze spójne z wyjazdem
 * (metody `replace*` ustawiają relację zwrotną).
 */
@Entity
@Table(name = "trips")
public class Trip extends BaseEntity {

    @Column(name = "slug", nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "tagline", nullable = false, length = 300)
    private String tagline;

    @Enumerated(EnumType.STRING)
    @Column(name = "continent", nullable = false, length = 20)
    private Continent continent;

    @Column(name = "country", nullable = false, length = 120)
    private String country;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "deposit", nullable = false, precision = 12, scale = 2)
    private BigDecimal deposit;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    /** Miejsca opłacone — rosną dopiero po potwierdzeniu płatności. */
    @Column(name = "booked_seats", nullable = false)
    private int bookedSeats;

    @Column(name = "published", nullable = false)
    private boolean published = true;

    @Column(name = "cover_image", nullable = false, length = 500)
    private String coverImage;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "trip_included", joinColumns = @JoinColumn(name = "trip_id"))
    @OrderColumn(name = "position_index")
    @Column(name = "item", nullable = false, length = 300)
    private List<String> included = new ArrayList<>();

    @OneToMany(
            mappedBy = "trip",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("dayNumber ASC")
    private List<TripDay> itinerary = new ArrayList<>();

    @OneToMany(
            mappedBy = "trip",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<TripDestination> destinations = new ArrayList<>();

    protected Trip() {
        // wymagane przez JPA
    }

    public Trip(
            String slug,
            String title,
            String tagline,
            Continent continent,
            String country,
            int durationDays,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal price,
            BigDecimal deposit,
            int capacity,
            String coverImage) {
        this.slug = slug;
        this.title = title;
        this.tagline = tagline;
        this.continent = continent;
        this.country = country;
        this.durationDays = durationDays;
        this.startDate = startDate;
        this.endDate = endDate;
        this.price = price;
        this.deposit = deposit;
        this.capacity = capacity;
        this.coverImage = coverImage;
    }

    /** Miejsca, których nie da się już sprzedać, bo są opłacone. */
    public int seatsLeftIgnoringHolds() {
        return Math.max(0, capacity - bookedSeats);
    }

    /**
     * Zajmuje miejsca po potwierdzonej płatności.
     *
     * @throws IllegalStateException gdy próba przekroczyłaby pojemność — to
     *     ostatnia linia obrony; właściwą kontrolę robi warstwa rezerwacji
     *     pod blokadą wiersza.
     */
    public void confirmSeats(int seats) {
        if (seats <= 0) {
            throw new IllegalArgumentException("Liczba miejsc musi być dodatnia");
        }
        if (bookedSeats + seats > capacity) {
            throw new IllegalStateException(
                    "Próba przekroczenia pojemności wyjazdu " + slug);
        }
        bookedSeats += seats;
    }

    /** Zwalnia miejsca (anulowanie / zwrot). */
    public void releaseSeats(int seats) {
        bookedSeats = Math.max(0, bookedSeats - seats);
    }

    public void updateDetails(
            String title,
            String tagline,
            Continent continent,
            String country,
            int durationDays,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal price,
            BigDecimal deposit,
            int capacity,
            String coverImage,
            boolean published) {
        if (capacity < bookedSeats) {
            throw new IllegalArgumentException(
                    "Pojemność nie może być mniejsza niż liczba sprzedanych miejsc");
        }
        this.title = title;
        this.tagline = tagline;
        this.continent = continent;
        this.country = country;
        this.durationDays = durationDays;
        this.startDate = startDate;
        this.endDate = endDate;
        this.price = price;
        this.deposit = deposit;
        this.capacity = capacity;
        this.coverImage = coverImage;
        this.published = published;
    }

    /** Podmienia cały plan dzień po dniu (panel admina). */
    public void replaceItinerary(List<TripDay> days) {
        itinerary.clear();
        days.stream()
                .sorted(Comparator.comparingInt(TripDay::getDayNumber))
                .forEach(
                        day -> {
                            day.assignTo(this);
                            itinerary.add(day);
                        });
    }

    public void replaceDestinations(List<TripDestination> newDestinations) {
        destinations.clear();
        newDestinations.stream()
                .sorted(Comparator.comparingInt(TripDestination::getPosition))
                .forEach(
                        destination -> {
                            destination.assignTo(this);
                            destinations.add(destination);
                        });
    }

    public void replaceIncluded(List<String> items) {
        included.clear();
        included.addAll(items == null ? List.of() : items);
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getTagline() {
        return tagline;
    }

    public Continent getContinent() {
        return continent;
    }

    public String getCountry() {
        return country;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getBookedSeats() {
        return bookedSeats;
    }

    public boolean isPublished() {
        return published;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public List<String> getIncluded() {
        return List.copyOf(included);
    }

    public List<TripDay> getItinerary() {
        return List.copyOf(itinerary);
    }

    public List<TripDestination> getDestinations() {
        return List.copyOf(destinations);
    }
}
