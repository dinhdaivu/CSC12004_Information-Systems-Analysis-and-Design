package vn.edu.hcmus.homestay.adapter.in.scheduler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.room.GenderPolicy;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@ExtendWith(MockitoExtension.class)
class PendingRentalRequestSchedulerTest {

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
                loadRentalRequestPort,
                saveRentalRequestPort,
                saveDepositPort,
                loadRoomPort,
                loadBedPort,
                loadUserPort,
                emailPort);
    }

    @Test
    void noRequests_doesNothing() {
        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(List.of());

        scheduler.processPendingRentalRequests();

        verify(saveDepositPort, never()).save(any());
        verify(saveRentalRequestPort, never()).save(any());
    }

    @Test
    void availableRoom_correctGender_createsDepositAndSetsDepositPending() {
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        RentalRequest req = rentalRequest(UUID.randomUUID(), customerId, roomId, null);
        Room room = room(roomId, RoomStatus.AVAILABLE, GenderPolicy.MIXED);
        User user = user(customerId, "male");

        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(List.of(req));
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room));
        when(loadUserPort.loadById(customerId)).thenReturn(Optional.of(user));
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            DepositRequest d = inv.getArgument(0);
            return new DepositRequest(
                    UUID.randomUUID(), d.getRentalRequestId(), d.getCustomerId(),
                    d.getRoomId(), d.getBedId(), d.getAmount(), d.getDueAt(),
                    null, null, null, null, d.getStatus(), Instant.now(), Instant.now());
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.processPendingRentalRequests();

        ArgumentCaptor<DepositRequest> depositCaptor = ArgumentCaptor.forClass(DepositRequest.class);
        verify(saveDepositPort).save(depositCaptor.capture());
        assertThat(depositCaptor.getValue().getStatus()).isEqualTo(DepositStatus.PENDING);
        assertThat(depositCaptor.getValue().getCustomerId()).isEqualTo(customerId);

        ArgumentCaptor<RentalRequest> requestCaptor = ArgumentCaptor.forClass(RentalRequest.class);
        verify(saveRentalRequestPort).save(requestCaptor.capture());
        assertThat(requestCaptor.getValue().getStatus())
                .isEqualTo(RentalRequestStatus.DEPOSIT_PENDING);
    }

    @Test
    void roomNotAvailable_setsRejected() {
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        RentalRequest req = rentalRequest(UUID.randomUUID(), customerId, roomId, null);
        Room room = room(roomId, RoomStatus.OCCUPIED, GenderPolicy.MIXED);

        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(List.of(req));
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room));
        when(loadUserPort.loadById(any())).thenReturn(Optional.empty());
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.processPendingRentalRequests();

        verify(saveDepositPort, never()).save(any());
        ArgumentCaptor<RentalRequest> captor = ArgumentCaptor.forClass(RentalRequest.class);
        verify(saveRentalRequestPort).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(RentalRequestStatus.REJECTED);
    }

    @Test
    void emailFailure_doesNotThrow() {
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        RentalRequest req = rentalRequest(UUID.randomUUID(), customerId, roomId, null);
        Room room = room(roomId, RoomStatus.AVAILABLE, GenderPolicy.MIXED);
        User user = user(customerId, "male");

        when(loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED))
                .thenReturn(List.of(req));
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room));
        when(loadUserPort.loadById(customerId)).thenReturn(Optional.of(user));
        when(saveDepositPort.save(any())).thenAnswer(inv -> {
            DepositRequest d = inv.getArgument(0);
            return new DepositRequest(
                    UUID.randomUUID(), d.getRentalRequestId(), d.getCustomerId(),
                    d.getRoomId(), d.getBedId(), d.getAmount(), d.getDueAt(),
                    null, null, null, null, d.getStatus(), Instant.now(), Instant.now());
        });
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("Email service unavailable"))
                .when(emailPort)
                .sendDepositInstruction(any(), any(), any(), any(), any());

        assertThatNoException().isThrownBy(() -> scheduler.processPendingRentalRequests());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RentalRequest rentalRequest(UUID id, UUID customerId, UUID roomId, UUID bedId) {
        return new RentalRequest(
                id, customerId, null, roomId, bedId, null, null, null,
                1, null, RentalRequestStatus.REQUESTED, Instant.now(), Instant.now());
    }

    private Room room(UUID id, RoomStatus status, GenderPolicy genderPolicy) {
        return new Room(
                id, UUID.randomUUID(), "101", "SINGLE", 2,
                BigDecimal.valueOf(3000000), List.of(), List.of(),
                status, genderPolicy, Instant.now(), Instant.now());
    }

    private User user(UUID id, String gender) {
        return new User(
                id, "customer@test.com", "Test Customer", "0901234567",
                null, gender, null, null,
                AppRole.CUSTOMER, UserStatus.ACTIVE, null,
                Instant.now(), Instant.now());
    }
}
