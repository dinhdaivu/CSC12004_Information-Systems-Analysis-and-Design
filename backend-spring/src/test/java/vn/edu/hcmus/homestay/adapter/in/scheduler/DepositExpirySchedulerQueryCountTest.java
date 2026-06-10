package vn.edu.hcmus.homestay.adapter.in.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
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
 * Reproduces the N+1 query pattern in {@link DepositExpiryScheduler} at N=50.
 *
 * <p>For each overdue deposit the scheduler issues an individual SELECT for the linked
 * rental request and an individual SELECT for the customer, producing 50+50 = 100 extra
 * round-trips instead of 2 bulk queries.
 *
 * <p>These assertions document the CURRENT (broken) baseline. After the batch-load fix the
 * counts must drop to loadRentalRequestPort×1 and loadUserPort×1 regardless of N.
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
    private EmailPort emailPort;

    private DepositExpiryScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new DepositExpiryScheduler(
                loadDepositPort, saveDepositPort, eventPublisher,
                saveRentalRequestPort, loadRentalRequestPort, loadUserPort, emailPort);
    }

    /**
     * N=50 overdue deposits, all with a linked rental request.
     *
     * <pre>
     * CURRENT call counts per deposit (2 individual SELECTs per item):
     *   loadRentalRequestPort.loadById  ×1  ← individual SELECT per deposit
     *   loadUserPort.loadById           ×1  ← individual SELECT per deposit
     *
     * At N=50 total read calls: loadRentalRequest×50 + loadUser×50 = 100
     * (Optimal after fix:        loadRentalRequest×1  + loadUser×1  = 2 bulk queries)
     * </pre>
     */
    @Test
    void baseline_N50_allWithRentalRequest_doubleIndividualLoad() {
        List<DepositRequest> deposits = buildDeposits(N);

        when(loadDepositPort.loadPendingExpired(any())).thenReturn(deposits);
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(loadRentalRequestPort.loadById(any())).thenAnswer(inv ->
                Optional.of(rentalRequest(inv.getArgument(0))));
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(loadUserPort.loadById(any())).thenAnswer(inv ->
                Optional.of(user(inv.getArgument(0))));

        scheduler.expireOverdueDeposits();

        // 1 loadById per deposit — individual SELECT instead of a single IN query
        verify(loadRentalRequestPort, times(N)).loadById(any());
        // 1 loadById per deposit — individual SELECT instead of a single IN query
        verify(loadUserPort, times(N)).loadById(any());
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
