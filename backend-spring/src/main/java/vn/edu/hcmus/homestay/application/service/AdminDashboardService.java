package vn.edu.hcmus.homestay.application.service;

import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.GetDashboardUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadPaymentPort;
import vn.edu.hcmus.homestay.application.port.out.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.domain.model.admin.AdminDashboard;

@Service
public class AdminDashboardService implements GetDashboardUseCase {

    private final LoadUserPort loadUserPort;
    private final LoadRoomPort loadRoomPort;
    private final LoadRentalRequestPort loadRentalRequestPort;
    private final LoadPaymentPort loadPaymentPort;

    public AdminDashboardService(
            LoadUserPort loadUserPort,
            LoadRoomPort loadRoomPort,
            LoadRentalRequestPort loadRentalRequestPort,
            LoadPaymentPort loadPaymentPort) {
        this.loadUserPort = loadUserPort;
        this.loadRoomPort = loadRoomPort;
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.loadPaymentPort = loadPaymentPort;
    }

    @Override
    public AdminDashboard getDashboard() {
        long totalUsers = loadUserPort.countAll();
        long totalRooms = loadRoomPort.countAllRooms();
        long activeBookings = loadRentalRequestPort.countNonCancelled();
        java.math.BigDecimal totalRevenue = loadPaymentPort.sumCompletedRevenue();
        java.util.List<vn.edu.hcmus.homestay.domain.model.rental.RentalRequest> recentBookings =
                loadRentalRequestPort.findRecent(10);
        java.util.List<vn.edu.hcmus.homestay.domain.model.payment.Payment> recentPayments =
                loadPaymentPort.findRecentCompleted(10);

        return new AdminDashboard(
                totalUsers, totalRooms, activeBookings, totalRevenue, recentBookings, recentPayments);
    }
}
