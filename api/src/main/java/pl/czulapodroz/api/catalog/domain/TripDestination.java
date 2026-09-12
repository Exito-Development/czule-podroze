package pl.czulapodroz.api.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import pl.czulapodroz.api.common.domain.BaseEntity;

/** Lokalizacja w ramach jednego wyjazdu (np. Koh Samui → Krabi → Bali). */
@Entity
@Table(name = "trip_destinations")
public class TripDestination extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "position_index", nullable = false)
    private int position;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "day_range", nullable = false, length = 60)
    private String dayRange;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Column(name = "image", nullable = false, length = 500)
    private String image;

    protected TripDestination() {
        // wymagane przez JPA
    }

    public TripDestination(
            int position, String name, String dayRange, String description, String image) {
        this.position = position;
        this.name = name;
        this.dayRange = dayRange;
        this.description = description;
        this.image = image;
    }

    void assignTo(Trip trip) {
        this.trip = trip;
    }

    public int getPosition() {
        return position;
    }

    public String getName() {
        return name;
    }

    public String getDayRange() {
        return dayRange;
    }

    public String getDescription() {
        return description;
    }

    public String getImage() {
        return image;
    }
}
