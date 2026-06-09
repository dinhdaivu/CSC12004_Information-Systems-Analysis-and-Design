package vn.edu.hcmus.homestay.application.service.crosscutting;

import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.crosscutting.GetDashboardUseCase;
import vn.edu.hcmus.homestay.application.port.out.financial.LoadPaymentPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.model.query.AdminDashboardView;

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
    public AdminDashboardView getDashboard() {
        long totalUsers = loadUserPort.countAll();
        long totalRooms = loadRoomPort.countAllRooms();
        long activeBookings = loadRentalRequestPort.countNonCancelled();
        java.math.BigDecimal totalRevenue = loadPaymentPort.sumCompletedRevenue();
        java.util.List<vn.edu.hcmus.homestay.domain.model.rental.RentalRequest> recentBookings =
                loadRentalRequestPort.findRecent(10);
        java.util.List<vn.edu.hcmus.homestay.domain.model.payment.Payment> recentPayments =
                loadPaymentPort.findRecentCompleted(10);

        return new AdminDashboardView(
                totalUsers, totalRooms, activeBookings, totalRevenue, recentBookings, recentPayments);
    }
}
