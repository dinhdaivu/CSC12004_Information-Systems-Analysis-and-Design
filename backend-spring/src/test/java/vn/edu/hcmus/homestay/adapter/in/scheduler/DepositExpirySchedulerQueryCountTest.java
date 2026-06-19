package vn.edu.hcmus.homestay.adapter.in.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

/**
 * Verifies the bulk-load fix in {@link DepositExpiryScheduler} at N=50.
 *
 * <p>Before the fix, the scheduler issued N individual SELECTs for rental requests and
 * N individual SELECTs for customers (100 extra round-trips at N=50). After the fix,
 * both are fetched with a single IN query each — 2 bulk calls regardless of N.
 */
@ExtendWith(MockitoExtension.class)
class DepositExpirySchedulerQueryCountTest {

    private static final int N = 50;

    @Mock
    private LoadDepositPort loadDepositPort;

    @Mock
    private SaveDepositPort saveDepositPort;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private SaveRentalRequestPort saveRentalRequestPort;

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private AsyncEmailSender asyncEmailSender;

    private DepositExpiryScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new DepositExpiryScheduler(
                loadDepositPort, saveDepositPort, eventPublisher,
                saveRentalRequestPort, loadRentalRequestPort, loadUserPort, asyncEmailSender);
    }

    /**
     * N=50 overdue deposits, all with a linked rental request.
     *
     * <pre>
     * After bulk-load fix:
     *   loadRentalRequestPort.loadByIds  ×1  ← single IN query for all rental requests
     *   loadUserPort.loadByIds           ×1  ← single IN query for all customers
     *
     * Total read calls: 2 (was 100 before the fix)
     * </pre>
     */
    @Test
    void fixed_N50_allWithRentalRequest_bulkLoad() {
        List<DepositRequest> deposits = buildDeposits(N);

        when(loadDepositPort.loadPendingExpired(any())).thenReturn(deposits);
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(loadRentalRequestPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            return ids.stream().map(this::rentalRequest).toList();
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(loadUserPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            return ids.stream().map(this::user).toList();
        });

        scheduler.expireOverdueDeposits();

        // 1 bulk loadByIds call each — replaced N individual loadById calls
        verify(loadRentalRequestPort, times(1)).loadByIds(any());
        verify(loadUserPort, times(1)).loadByIds(any());
        verify(saveDepositPort, times(N)).save(any());
        verify(saveRentalRequestPort, times(N)).save(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private List<DepositRequest> buildDeposits(int count) {
        return IntStream.range(0, count)
                .mapToObj(i -> new DepositRequest(
                        UUID.randomUUID(),
                        UUID.randomUUID(),      // rentalRequestId — always present
                        UUID.randomUUID(),      // customerId
                        UUID.randomUUID(),      // roomId
                        null,                   // bedId
                        BigDecimal.valueOf(3_000_000),
                        Instant.now().minusSeconds(86_400),
                        null, null, null, null,
                        DepositStatus.PENDING,
                        Instant.now().minusSeconds(86_400),
                        Instant.now().minusSeconds(86_400)))
                .toList();
    }

    private RentalRequest rentalRequest(UUID id) {
        return new RentalRequest(
                id, UUID.randomUUID(), null, UUID.randomUUID(), null,
                null, null, null, 1, null,
                RentalRequestStatus.DEPOSIT_PENDING, Instant.now(), Instant.now());
    }

    private User user(UUID id) {
        return new User(
                id, "u@test.com", "Test User", "090",
                null, "male", null, null,
                AppRole.CUSTOMER, UserStatus.ACTIVE, null,
                Instant.now(), Instant.now());
    }
}
