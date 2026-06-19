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
 * Verifies the bulk-load fix in {@link PendingRentalRequestScheduler} at N=50.
 *
 * <p>Before the fix, the scheduler called {@code loadRoomPort.loadById} three times per request
 * (checkAvailability, checkGenderPolicy, resolvePrice) and {@code loadUserPort.loadById} once,
 * producing 200 individual SELECT calls at N=50. After the fix, both are fetched with a single
 * IN query each — 2 bulk calls regardless of N.
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
    private AsyncEmailSender asyncEmailSender;

    private PendingRentalRequestScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new PendingRentalRequestScheduler(
                loadRentalRequestPort, saveRentalRequestPort, saveDepositPort,
                loadRoomPort, loadBedPort, loadUserPort, asyncEmailSender);
    }

    /**
     * N=50 room-only requests, all AVAILABLE + MIXED gender → all accepted.
     *
     * <pre>
     * After bulk-load fix:
     *   loadRoomPort.loadByIds   ×1  ← single IN query for all rooms
     *   loadUserPort.loadByIds   ×1  ← single IN query for all customers
     *
     * Total read calls: 2 (was 200 before the fix)
     * </pre>
     */
    @Test
    void fixed_N50_roomOnly_allAccepted_bulkLoad() {
        List<RentalRequest> requests = buildRequests(N);

        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(requests);
        when(loadRoomPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            return ids.stream().map(this::availableRoom).toList();
        });
        when(loadUserPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            return ids.stream().map(this::user).toList();
        });
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            DepositRequest d = inv.getArgument(0);
            return new DepositRequest(
                    UUID.randomUUID(), d.getRentalRequestId(), d.getCustomerId(),
                    d.getRoomId(), d.getBedId(), d.getAmount(), d.getDueAt(),
                    null, null, null, null, d.getStatus(), Instant.now(), Instant.now());
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.processPendingRentalRequests();

        // 1 bulk loadByIds call each — replaced 3×N room and N user individual lookups
        verify(loadRoomPort, times(1)).loadByIds(any());
        verify(loadUserPort, times(1)).loadByIds(any());
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
