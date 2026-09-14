package pl.czulapodroz.api.catalog.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import pl.czulapodroz.api.common.domain.BaseEntity;

/** Jeden dzień planu wyjazdu — element pionowej osi czasu na stronie. */
@Entity
@Table(name = "trip_days")
public class TripDay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "day_number", nullable = false)
    private int dayNumber;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "trip_day_tags", joinColumns = @JoinColumn(name = "trip_day_id"))
    @OrderColumn(name = "position_index")
    @Column(name = "tag", nullable = false, length = 40)
    private List<String> tags = new ArrayList<>();

    protected TripDay() {
        // wymagane przez JPA
    }

    public TripDay(int dayNumber, String title, String description, List<String> tags) {
        this.dayNumber = dayNumber;
        this.title = title;
        this.description = description;
        this.tags = new ArrayList<>(tags == null ? List.of() : tags);
    }

    void assignTo(Trip trip) {
        this.trip = trip;
    }

    public Trip getTrip() {
        return trip;
    }

    public int getDayNumber() {
        return dayNumber;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getTags() {
        return List.copyOf(tags);
    }
}
