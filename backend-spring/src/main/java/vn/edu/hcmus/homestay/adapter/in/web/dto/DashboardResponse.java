package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import vn.edu.hcmus.homestay.domain.model.admin.AdminDashboard;

public class DashboardResponse {

    @JsonProperty("total_users")
    private long totalUsers;

    @JsonProperty("total_rooms")
    private long totalRooms;

    @JsonProperty("active_bookings")
    private long activeBookings;

    @JsonProperty("total_revenue")
    private BigDecimal totalRevenue;

    @JsonProperty("recent_bookings")
    private List<Map<String, Object>> recentBookings;

    @JsonProperty("recent_payments")
    private List<Map<String, Object>> recentPayments;

    public static DashboardResponse from(AdminDashboard d) {
        DashboardResponse r = new DashboardResponse();
        r.totalUsers = d.getTotalUsers();
        r.totalRooms = d.getTotalRooms();
        r.activeBookings = d.getActiveBookings();
        r.totalRevenue = d.getTotalRevenue();
        r.recentBookings = d.getRecentBookings().stream()
                .map(b -> Map.<String, Object>of(
                        "id", b.getId().toString(),
                        "customer_id", b.getCustomerId().toString(),
                        "status", b.getStatus().name().toLowerCase(),
                        "created_at", b.getCreatedAt() != null ? b.getCreatedAt().toString() : ""))
                .collect(Collectors.toList());
        r.recentPayments = d.getRecentPayments().stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getId().toString(),
                        "amount", p.getAmount().toString(),
                        "payment_method",
                                p.getPaymentMethod() != null
                                        ? p.getPaymentMethod().name().toLowerCase()
                                        : "",
                        "created_at", p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""))
                .collect(Collectors.toList());
        return r;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<Map<String, Object>> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<Map<String, Object>> recentBookings) {
        this.recentBookings = recentBookings;
    }

    public List<Map<String, Object>> getRecentPayments() {
        return recentPayments;
    }

    public void setRecentPayments(List<Map<String, Object>> recentPayments) {
        this.recentPayments = recentPayments;
    }
}
