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
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.room.GenderPolicy;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

/**
 * Reproduces the N+1 query pattern in {@link PendingRentalRequestScheduler} at N=50.
 *
 * <p>For each pending request the scheduler calls {@code loadRoomPort.loadById} three times
 * (checkAvailability, checkGenderPolicy, resolvePrice) and {@code loadUserPort.loadById} once,
 * producing 150+50 = 200 individual SELECT calls instead of 2 bulk queries.
 *
 * <p>These assertions document the CURRENT (broken) baseline. After the batch-load fix the
 * counts must drop to loadRoomPort×1 and loadUserPort×1 regardless of N.
 */
@ExtendWith(MockitoExtension.class)
class PendingRentalRequestSchedulerQueryCountTest {

    private static final int N = 50;

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private SaveRentalRequestPort saveRentalRequestPort;

    @Mock
    private SaveDepositPort saveDepositPort;

    @Mock
    private LoadRoomPort loadRoomPort;

    @Mock
    private LoadBedPort loadBedPort;

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private EmailPort emailPort;

    private PendingRentalRequestScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new PendingRentalRequestScheduler(
                loadRentalRequestPort, saveRentalRequestPort, saveDepositPort,
                loadRoomPort, loadBedPort, loadUserPort, emailPort);
    }

    /**
     * N=50 room-only requests, all AVAILABLE + MIXED gender → all accepted.
     *
     * <pre>
     * CURRENT call counts per request (3 call-sites hit loadRoomPort.loadById):
     *   checkAvailability  → loadRoomPort.loadById  ×1
     *   checkGenderPolicy  → loadRoomPort.loadById  ×1   ← duplicate load
     *   resolvePrice       → loadRoomPort.loadById  ×1   ← duplicate load
     *   acceptRequest      → loadUserPort.loadById  ×1
     *
     * At N=50 total read calls: loadRoomPort×150 + loadUserPort×50 = 200
     * (Optimal after fix:        loadRoomPort×1   + loadUserPort×1 = 2 bulk queries)
     * </pre>
     */
    @Test
    void baseline_N50_roomOnly_allAccepted_tripleRoomLoad() {
        List<RentalRequest> requests = buildRequests(N);

        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(requests);
        when(loadRoomPort.loadById(any())).thenAnswer(inv ->
                Optional.of(availableRoom(inv.getArgument(0))));
        when(loadUserPort.loadById(any())).thenAnswer(inv ->
                Optional.of(user(inv.getArgument(0))));
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            DepositRequest d = inv.getArgument(0);
            return new DepositRequest(
                    UUID.randomUUID(), d.getRentalRequestId(), d.getCustomerId(),
                    d.getRoomId(), d.getBedId(), d.getAmount(), d.getDueAt(),
                    null, null, null, null, d.getStatus(), Instant.now(), Instant.now());
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.processPendingRentalRequests();

        // 3 loadById calls per request: checkAvailability + checkGenderPolicy + resolvePrice
        verify(loadRoomPort, times(3 * N)).loadById(any());
        // 1 loadById call per request: acceptRequest email lookup
        verify(loadUserPort, times(N)).loadById(any());
        // 1 save per request
        verify(saveDepositPort, times(N)).save(any());
        verify(saveRentalRequestPort, times(N)).save(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private List<RentalRequest> buildRequests(int count) {
        return IntStream.range(0, count)
                .mapToObj(i -> new RentalRequest(
                        UUID.randomUUID(), UUID.randomUUID(), null,
                        UUID.randomUUID(), null, null, null, null,
                        1, null, RentalRequestStatus.REQUESTED, Instant.now(), Instant.now()))
                .toList();
    }

    private Room availableRoom(UUID id) {
        return new Room(
                id, UUID.randomUUID(), "R" + id.toString().substring(0, 4),
                "SINGLE", 2, BigDecimal.valueOf(3_000_000),
                List.of(), List.of(),
                RoomStatus.AVAILABLE, GenderPolicy.MIXED,
                Instant.now(), Instant.now());
    }

    private User user(UUID id) {
        return new User(
                id, "u@test.com", "Test User", "090",
                null, "male", null, null,
                AppRole.CUSTOMER, UserStatus.ACTIVE, null,
                Instant.now(), Instant.now());
    }
}
