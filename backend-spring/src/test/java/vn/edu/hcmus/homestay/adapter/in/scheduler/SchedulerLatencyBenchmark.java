package vn.edu.hcmus.homestay.adapter.in.scheduler;

import static org.mockito.ArgumentMatchers.any;
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
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.room.GenderPolicy;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

/**
 * Measures scheduler wall-clock time by injecting a simulated DB round-trip delay
 * into every port call.
 *
 * <p>DB_LATENCY_MS models a realistic remote Supabase/PostgreSQL connection (5 ms/query).
 * After the N+1 fix, both schedulers issue 3 bulk queries regardless of N, so the
 * elapsed time should be close to:
 *   3 × DB_LATENCY_MS + 2N × DB_LATENCY_MS  (3 reads + 2N writes)
 *
 * <p>Expected results at N=50, DB_LATENCY_MS=5:
 * <pre>
 *   Pending  AFTER:  ~515 ms  (3 reads × 5ms + 100 writes × 5ms)
 *   Expiry   AFTER:  ~515 ms  (3 reads × 5ms + 100 writes × 5ms)
 * </pre>
 */
@ExtendWith(MockitoExtension.class)
class SchedulerLatencyBenchmark {

    /** Simulated DB round-trip latency in milliseconds per port call. */
    private static final long DB_LATENCY_MS = 5;

    private static final int N = 50;

    // ── PendingRentalRequestScheduler deps ────────────────────────────────────
    @Mock LoadRentalRequestPort loadRentalRequestPort;
    @Mock SaveRentalRequestPort saveRentalRequestPort;
    @Mock SaveDepositPort saveDepositPort;
    @Mock LoadRoomPort loadRoomPort;
    @Mock LoadBedPort loadBedPort;
    @Mock LoadUserPort loadUserPort;
    @Mock AsyncEmailSender asyncEmailSender;

    // ── DepositExpiryScheduler deps ───────────────────────────────────────────
    @Mock LoadDepositPort loadDepositPort;
    @Mock ApplicationEventPublisher eventPublisher;

    private PendingRentalRequestScheduler pendingScheduler;
    private DepositExpiryScheduler expiryScheduler;

    @BeforeEach
    void setUp() {
        pendingScheduler = new PendingRentalRequestScheduler(
                loadRentalRequestPort, saveRentalRequestPort, saveDepositPort,
                loadRoomPort, loadBedPort, loadUserPort, asyncEmailSender);

        expiryScheduler = new DepositExpiryScheduler(
                loadDepositPort, saveDepositPort, eventPublisher,
                saveRentalRequestPort, loadRentalRequestPort, loadUserPort, asyncEmailSender);
    }

    // ── Benchmarks ────────────────────────────────────────────────────────────

    @Test
    void benchmark_pendingRentalRequestScheduler_N50_mixed() {
        wirePendingScheduler(GenderPolicy.MIXED);

        long start = System.currentTimeMillis();
        pendingScheduler.processPendingRentalRequests();
        long elapsed = System.currentTimeMillis() - start;

        // After fix: 3 bulk reads (room + user + bed) + 2N writes
        long readCalls  = 3L;
        long writeCalls = N + N;  // 100

        printResult("PendingRentalRequestScheduler [MIXED]", N, readCalls, writeCalls, elapsed);
    }

    @Test
    void benchmark_pendingRentalRequestScheduler_N50_nonMixed_worstCase() {
        wirePendingScheduler(GenderPolicy.MALE);

        long start = System.currentTimeMillis();
        pendingScheduler.processPendingRentalRequests();
        long elapsed = System.currentTimeMillis() - start;

        // After fix: same 3 bulk reads regardless of gender policy
        long readCalls  = 3L;
        long writeCalls = N + N;  // 100

        printResult("PendingRentalRequestScheduler [non-MIXED]", N, readCalls, writeCalls, elapsed);
    }

    @Test
    void benchmark_depositExpiryScheduler_N50() {
        wireExpiryScheduler();

        long start = System.currentTimeMillis();
        expiryScheduler.expireOverdueDeposits();
        long elapsed = System.currentTimeMillis() - start;

        // After fix: 3 bulk reads (deposits + rentalRequests + users) + 2N writes
        long readCalls  = 3L;
        long writeCalls = N + N;  // 100

        printResult("DepositExpiryScheduler", N, readCalls, writeCalls, elapsed);
    }

    // ── wiring ────────────────────────────────────────────────────────────────

    private void wirePendingScheduler(GenderPolicy policy) {
        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(buildRequests(N));

        when(loadRoomPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            sleep();
            return ids.stream().map(id -> availableRoom(id, policy)).toList();
        });
        when(loadBedPort.loadByIds(any())).thenAnswer(inv -> {
            sleep();
            return List.of();
        });
        when(loadUserPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            sleep();
            return ids.stream().map(id -> userWithGender(id, policy.name().toLowerCase())).toList();
        });
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            sleep();
            DepositRequest d = inv.getArgument(0);
            return new DepositRequest(
                    UUID.randomUUID(), d.getRentalRequestId(), d.getCustomerId(),
                    d.getRoomId(), d.getBedId(), d.getAmount(), d.getDueAt(),
                    null, null, null, null, d.getStatus(), Instant.now(), Instant.now());
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> {
            sleep();
            return inv.getArgument(0);
        });
    }

    private void wireExpiryScheduler() {
        when(loadDepositPort.loadPendingExpired(any())).thenAnswer(inv -> {
            sleep();
            return buildDeposits(N);
        });
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            sleep();
            return inv.getArgument(0);
        });
        when(loadRentalRequestPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            sleep();
            return ids.stream().map(this::rentalRequest).toList();
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> {
            sleep();
            return inv.getArgument(0);
        });
        when(loadUserPort.loadByIds(any())).thenAnswer(inv -> {
            Collection<UUID> ids = inv.getArgument(0);
            sleep();
            return ids.stream().map(id -> userWithGender(id, "male")).toList();
        });
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static void sleep() {
        try {
            Thread.sleep(DB_LATENCY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void printResult(
            String name, int n, long readCalls, long writeCalls, long elapsedMs) {

        long readMs      = readCalls  * DB_LATENCY_MS;
        long writeMs     = writeCalls * DB_LATENCY_MS;
        long projectedMs = readMs + writeMs;

        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════════╗");
        System.out.printf ("║  %-64s  ║%n", name + " @ N=" + n);
        System.out.println("╠══════════════════════════════════════════════════════════════════╣");
        System.out.printf ("║  DB_LATENCY_MS per call  : %-37d  ║%n", DB_LATENCY_MS);
        System.out.printf ("║  Read calls (bulk)       : %-37d  ║%n", readCalls);
        System.out.printf ("║  Write calls             : %-37d  ║%n", writeCalls);
        System.out.println("╠══════════════════════════════════════════════════════════════════╣");
        System.out.printf ("║  Projected total : %5d ms                                      ║%n",
                projectedMs);
        System.out.printf ("║  Measured  total : %5d ms                                      ║%n",
                elapsedMs);
        System.out.println("╚══════════════════════════════════════════════════════════════════╝");
        System.out.println();
    }

    private List<RentalRequest> buildRequests(int count) {
        return IntStream.range(0, count)
                .mapToObj(i -> new RentalRequest(
                        UUID.randomUUID(), UUID.randomUUID(), null,
                        UUID.randomUUID(), null, null, null, null,
                        1, null, RentalRequestStatus.REQUESTED, Instant.now(), Instant.now()))
                .toList();
    }

    private List<DepositRequest> buildDeposits(int count) {
        return IntStream.range(0, count)
                .mapToObj(i -> new DepositRequest(
                        UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        UUID.randomUUID(), null, BigDecimal.valueOf(3_000_000),
                        Instant.now().minusSeconds(86_400),
                        null, null, null, null, DepositStatus.PENDING,
                        Instant.now().minusSeconds(86_400),
                        Instant.now().minusSeconds(86_400)))
                .toList();
    }

    private Room availableRoom(UUID id, GenderPolicy policy) {
        return new Room(
                id, UUID.randomUUID(), "R" + id.toString().substring(0, 4),
                "SINGLE", 2, BigDecimal.valueOf(3_000_000),
                List.of(), List.of(),
                RoomStatus.AVAILABLE, policy,
                Instant.now(), Instant.now());
    }

    private RentalRequest rentalRequest(UUID id) {
        return new RentalRequest(
                id, UUID.randomUUID(), null, UUID.randomUUID(), null,
                null, null, null, 1, null,
                RentalRequestStatus.DEPOSIT_PENDING, Instant.now(), Instant.now());
    }

    private User userWithGender(UUID id, String gender) {
        return new User(
                id, "u@test.com", "Test User", "090",
                null, gender, null, null,
                AppRole.CUSTOMER, UserStatus.ACTIVE, null,
                Instant.now(), Instant.now());
    }
}
