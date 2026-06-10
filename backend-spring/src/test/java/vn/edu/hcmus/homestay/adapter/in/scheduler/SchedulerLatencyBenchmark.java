package vn.edu.hcmus.homestay.adapter.in.scheduler;

import static org.mockito.ArgumentMatchers.any;
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
 * This makes the N+1 overhead directly visible in elapsed milliseconds.
 *
 * <p>Two scenarios are covered for PendingRentalRequestScheduler:
 * <ul>
 *   <li>MIXED gender policy — checkGenderPolicy early-exits without loading the user,
 *       so loadUserPort is called once per request (acceptRequest only). Read calls = 200.</li>
 *   <li>Non-MIXED (MALE/FEMALE) — checkGenderPolicy also loads the user (line 107),
 *       so loadUserPort is called twice per request. Read calls = 250. This is the worst case.</li>
 * </ul>
 *
 * <p>The output shows BOTH total speedup and read-only speedup. Writes are unchanged
 * before and after the fix, so they compress the headline number — read-only speedup
 * is the true measure of the optimization.
 *
 * <p>Expected results at N=50, DB_LATENCY_MS=5:
 * <pre>
 *   Pending (MIXED)     BEFORE: ~1 500 ms  reads 200×5 + writes 100×5
 *                       AFTER:  ~  515 ms  reads 3×5   + writes 100×5
 *                       Read-only speedup: ~67×   Total speedup: ~2.9×
 *
 *   Pending (non-MIXED) BEFORE: ~1 750 ms  reads 250×5 + writes 100×5
 *                       AFTER:  ~  515 ms  reads 3×5   + writes 100×5
 *                       Read-only speedup: ~83×   Total speedup: ~3.4×
 *
 *   DepositExpiry       BEFORE: ~1 005 ms  reads 101×5 + writes 100×5
 *                       AFTER:  ~  515 ms  reads 3×5   + writes 100×5
 *                       Read-only speedup: ~34×   Total speedup: ~2.0×
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
    @Mock EmailPort emailPort;

    // ── DepositExpiryScheduler deps ───────────────────────────────────────────
    @Mock LoadDepositPort loadDepositPort;
    @Mock ApplicationEventPublisher eventPublisher;

    private PendingRentalRequestScheduler pendingScheduler;
    private DepositExpiryScheduler expiryScheduler;

    @BeforeEach
    void setUp() {
        pendingScheduler = new PendingRentalRequestScheduler(
                loadRentalRequestPort, saveRentalRequestPort, saveDepositPort,
                loadRoomPort, loadBedPort, loadUserPort, emailPort);

        expiryScheduler = new DepositExpiryScheduler(
                loadDepositPort, saveDepositPort, eventPublisher,
                saveRentalRequestPort, loadRentalRequestPort, loadUserPort, emailPort);
    }

    // ── Benchmarks ────────────────────────────────────────────────────────────

    @Test
    void benchmark_pendingRentalRequestScheduler_N50_mixed() throws Exception {
        wirePendingScheduler(GenderPolicy.MIXED);

        long start = System.currentTimeMillis();
        pendingScheduler.processPendingRentalRequests();
        long elapsed = System.currentTimeMillis() - start;

        // MIXED policy: checkGenderPolicy exits early (line 104) — loadUserPort NOT called there.
        // loadUserPort is called only in acceptRequest: 1 call per request.
        //   loadRoomPort : checkAvailability(1) + checkGenderPolicy(1) + resolvePrice(1) = 3×N = 150
        //   loadUserPort : acceptRequest(1) = 1×N = 50
        //   total reads  : 200
        long readCalls  = 3L * N + N;  // 200
        long writeCalls = N + N;        // 100

        printResult("PendingRentalRequestScheduler [MIXED]", N, readCalls, writeCalls, elapsed);
    }

    @Test
    void benchmark_pendingRentalRequestScheduler_N50_nonMixed_worstCase() throws Exception {
        wirePendingScheduler(GenderPolicy.MALE);

        long start = System.currentTimeMillis();
        pendingScheduler.processPendingRentalRequests();
        long elapsed = System.currentTimeMillis() - start;

        // Non-MIXED policy: checkGenderPolicy does NOT early-exit — loads user at line 107.
        // loadUserPort is called TWICE per request: checkGenderPolicy + acceptRequest.
        //   loadRoomPort : checkAvailability(1) + checkGenderPolicy(1) + resolvePrice(1) = 3×N = 150
        //   loadUserPort : checkGenderPolicy(1) + acceptRequest(1) = 2×N = 100
        //   total reads  : 250  ← worst case, not visible in the MIXED benchmark
        long readCalls  = 3L * N + 2L * N;  // 250
        long writeCalls = N + N;              // 100

        printResult("PendingRentalRequestScheduler [non-MIXED worst case]", N, readCalls, writeCalls, elapsed);
    }

    @Test
    void benchmark_depositExpiryScheduler_N50() throws Exception {
        wireExpiryScheduler();

        long start = System.currentTimeMillis();
        expiryScheduler.expireOverdueDeposits();
        long elapsed = System.currentTimeMillis() - start;

        // read calls: loadPendingExpired×1 + loadRentalRequest×50 + loadUser×50 = 101
        // write calls: saveDeposit×50 + saveRentalRequest×50 = 100
        long readCalls  = 1 + N + N;    // 101
        long writeCalls = N + N;         // 100
        long totalCalls = readCalls + writeCalls;

        printResult("DepositExpiryScheduler", N, readCalls, writeCalls, elapsed);
    }

    // ── wiring ────────────────────────────────────────────────────────────────

    private void wirePendingScheduler(GenderPolicy policy) {
        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(buildRequests(N));

        when(loadRoomPort.loadById(any())).thenAnswer(inv -> {
            sleep();
            return Optional.of(availableRoom(inv.getArgument(0), policy));
        });
        // For non-MIXED rooms the user's gender must match the room policy so the request is accepted.
        when(loadUserPort.loadById(any())).thenAnswer(inv -> {
            sleep();
            return Optional.of(userWithGender(inv.getArgument(0), policy.name().toLowerCase()));
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

    private void wireExpiryScheduler() throws Exception {
        when(loadDepositPort.loadPendingExpired(any())).thenAnswer(inv -> {
            sleep();
            return buildDeposits(N);
        });
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            sleep();
            return inv.getArgument(0);
        });
        when(loadRentalRequestPort.loadById(any())).thenAnswer(inv -> {
            sleep();
            return Optional.of(rentalRequest(inv.getArgument(0)));
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> {
            sleep();
            return inv.getArgument(0);
        });
        when(loadUserPort.loadById(any())).thenAnswer(inv -> {
            sleep();
            return Optional.of(userWithGender(inv.getArgument(0), "male"));
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

        long readBeforeMs   = readCalls  * DB_LATENCY_MS;
        long writeMs        = writeCalls * DB_LATENCY_MS;
        long readAfterMs    = 3          * DB_LATENCY_MS;  // 3 bulk queries after fix
        long totalAfterMs   = readAfterMs + writeMs;

        double readSpeedup  = (double) readBeforeMs / Math.max(readAfterMs, 1);
        double totalSpeedup = (double) elapsedMs    / Math.max(totalAfterMs, 1);

        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════════╗");
        System.out.printf ("║  %-64s  ║%n", name + " @ N=" + n);
        System.out.println("╠══════════════════════════════════════════════════════════════════╣");
        System.out.printf ("║  DB_LATENCY_MS per call  : %-37d  ║%n", DB_LATENCY_MS);
        System.out.printf ("║  Read calls (before)     : %-37d  ║%n", readCalls);
        System.out.printf ("║  Write calls             : %-37d  ║%n", writeCalls);
        System.out.println("╠══════════════════════════════════════════════════════════════════╣");
        System.out.printf ("║  BEFORE  total (measured)  : %5d ms                             ║%n", elapsedMs);
        System.out.printf ("║  AFTER   total (projected) : %5d ms  (3 reads + %d writes)      ║%n",
                totalAfterMs, writeCalls);
        System.out.println("╠══════════════════════════════════════════════════════════════════╣");
        System.out.printf ("║  Speedup — total           :  %.1fx  (writes unchanged, mask gain) ║%n",
                totalSpeedup);
        System.out.printf ("║  Speedup — reads only      : %.0fx  (%d×5ms → 3×5ms)              ║%n",
                readSpeedup, readCalls);
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
