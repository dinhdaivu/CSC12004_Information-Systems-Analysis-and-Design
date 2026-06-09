package vn.edu.hcmus.homestay.application.model.query;

import java.math.BigDecimal;
import java.util.List;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

/** Read model / projection for the admin dashboard — not a DB table. */
public class AdminDashboardView {

    private final long totalUsers;
    private final long totalRooms;
    private final long activeBookings;
    private final BigDecimal totalRevenue;
    private final List<RentalRequest> recentBookings;
    private final List<Payment> recentPayments;

    public AdminDashboardView(
            long totalUsers,
            long totalRooms,
            long activeBookings,
            BigDecimal totalRevenue,
            List<RentalRequest> recentBookings,
            List<Payment> recentPayments) {
        this.totalUsers = totalUsers;
        this.totalRooms = totalRooms;
        this.activeBookings = activeBookings;
        this.totalRevenue = totalRevenue;
        this.recentBookings = recentBookings;
        this.recentPayments = recentPayments;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public List<RentalRequest> getRecentBookings() {
        return recentBookings;
    }

    public List<Payment> getRecentPayments() {
        return recentPayments;
    }
}
