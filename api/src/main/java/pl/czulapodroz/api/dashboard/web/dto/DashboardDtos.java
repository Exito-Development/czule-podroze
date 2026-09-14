package pl.czulapodroz.api.dashboard.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Kontrakty pulpitu organizatorek. */
public final class DashboardDtos {

    private DashboardDtos() {}

    /**
     * Liczby, które organizatorki sprawdzają codziennie.
     *
     * @param outstandingBalance suma dopłat do zebrania przed wyjazdami
     */
    public record SummaryResponse(
            int tripsPublished,
            int tripsUpcoming,
            int seatsSold,
            int seatsCapacity,
            int ordersConfirmed,
            int ordersPendingPayment,
            BigDecimal revenuePaid,
            BigDecimal outstandingBalance,
            int waitlistWaiting,
            int participantsIncomplete,
            List<TripRow> trips,
            List<RecentOrderRow> recentOrders) {}

    public record TripRow(
            String slug,
            String title,
            LocalDate startDate,
            String status,
            int capacity,
            int seatsSold,
            int seatsHeld,
            int seatsAvailable,
            int waitlist,
            BigDecimal revenuePaid,
            BigDecimal outstandingBalance) {}

    public record RecentOrderRow(
            String orderNumber,
            String customerName,
            String customerEmail,
            String status,
            BigDecimal amountDueNow,
            BigDecimal amountPaid,
            String createdAt,
            List<String> trips) {}
}
