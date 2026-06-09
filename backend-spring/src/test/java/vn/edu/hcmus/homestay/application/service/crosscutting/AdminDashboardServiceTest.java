package vn.edu.hcmus.homestay.application.service.crosscutting;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.out.financial.LoadPaymentPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.model.query.AdminDashboardView;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentType;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private LoadRoomPort loadRoomPort;

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private LoadPaymentPort loadPaymentPort;

    private AdminDashboardService service;

    @BeforeEach
    void setUp() {
        service = new AdminDashboardService(
                loadUserPort, loadRoomPort, loadRentalRequestPort, loadPaymentPort);
    }

    @Test
    void getDashboard_assemblesAllFields() {
        RentalRequest booking = rentalRequest();
        Payment payment = payment();

        when(loadUserPort.countAll()).thenReturn(42L);
        when(loadRoomPort.countAllRooms()).thenReturn(10L);
        when(loadRentalRequestPort.countNonCancelled()).thenReturn(7L);
        when(loadPaymentPort.sumCompletedRevenue()).thenReturn(BigDecimal.valueOf(9_000_000));
        when(loadRentalRequestPort.findRecent(10)).thenReturn(List.of(booking));
        when(loadPaymentPort.findRecentCompleted(10)).thenReturn(List.of(payment));

        AdminDashboardView result = service.getDashboard();

        assertThat(result.getTotalUsers()).isEqualTo(42L);
        assertThat(result.getTotalRooms()).isEqualTo(10L);
        assertThat(result.getActiveBookings()).isEqualTo(7L);
        assertThat(result.getTotalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(9_000_000));
        assertThat(result.getRecentBookings()).hasSize(1);
        assertThat(result.getRecentPayments()).hasSize(1);
    }

    @Test
    void getDashboard_zeroRevenue_whenNoPayments() {
        when(loadUserPort.countAll()).thenReturn(0L);
        when(loadRoomPort.countAllRooms()).thenReturn(0L);
        when(loadRentalRequestPort.countNonCancelled()).thenReturn(0L);
        when(loadPaymentPort.sumCompletedRevenue()).thenReturn(BigDecimal.ZERO);
        when(loadRentalRequestPort.findRecent(10)).thenReturn(List.of());
        when(loadPaymentPort.findRecentCompleted(10)).thenReturn(List.of());

        AdminDashboardView result = service.getDashboard();

        assertThat(result.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getRecentBookings()).isEmpty();
        assertThat(result.getRecentPayments()).isEmpty();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RentalRequest rentalRequest() {
        return new RentalRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                null,
                null,
                null,
                null,
                1,
                null,
                RentalRequestStatus.REQUESTED,
                Instant.now(),
                Instant.now());
    }

    private Payment payment() {
        return new Payment(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                null,
                null,
                BigDecimal.valueOf(1_000_000),
                PaymentType.RENT,
                PaymentStatus.COMPLETED,
                PaymentMethod.CASH,
                null,
                null,
                null,
                Instant.now(),
                Instant.now());
    }
}
