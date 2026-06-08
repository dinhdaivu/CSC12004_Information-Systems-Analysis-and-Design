package vn.edu.hcmus.homestay.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.out.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.mybooking.MyBooking;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@ExtendWith(MockitoExtension.class)
class MyBookingServiceTest {

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private LoadDepositPort loadDepositPort;

    @Mock
    private LoadRoomPort loadRoomPort;

    @Mock
    private LoadBedPort loadBedPort;

    @Mock
    private LoadBranchPort loadBranchPort;

    @Mock
    private SaveRentalRequestPort saveRentalRequestPort;

    @Mock
    private SaveDepositPort saveDepositPort;

    private MyBookingService myBookingService;

    @BeforeEach
    void setUp() {
        myBookingService = new MyBookingService(
                loadRentalRequestPort,
                loadDepositPort,
                loadRoomPort,
                loadBedPort,
                loadBranchPort,
                saveRentalRequestPort,
                saveDepositPort);
    }

    @Test
    void getMyBooking_owner_assemblesCorrectly() {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        // roomId=null so loadRoomPort is never called — no stub needed
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.REQUESTED, null, null);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));
        when(loadDepositPort.loadAll()).thenReturn(List.of());

        MyBooking booking = myBookingService.getMyBooking(bookingId, customerId);

        assertThat(booking.getId()).isEqualTo(bookingId);
        assertThat(booking.getCustomerId()).isEqualTo(customerId);
        assertThat(booking.getStatus()).isEqualTo("requested");
    }

    @Test
    void getMyBooking_notOwner_throwsForbidden() {
        UUID customerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.REQUESTED, null, null);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));

        assertThatThrownBy(() -> myBookingService.getMyBooking(bookingId, otherUserId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void checkAvailability_roomAvailable_returnsTrue() {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.REQUESTED, roomId, null);
        Room room = room(roomId, RoomStatus.AVAILABLE);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room));

        boolean result = myBookingService.checkAvailability(bookingId, customerId);

        assertThat(result).isTrue();
        verify(saveRentalRequestPort, never()).save(any());
    }

    @Test
    void checkAvailability_roomNotAvailable_rejectsAndCancelsDeposit() {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        UUID depositId = UUID.randomUUID();
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.REQUESTED, roomId, null);
        Room room = room(roomId, RoomStatus.OCCUPIED);
        DepositRequest deposit = deposit(depositId, bookingId, DepositStatus.PENDING);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room));
        when(loadDepositPort.loadAll()).thenReturn(List.of(deposit));
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = myBookingService.checkAvailability(bookingId, customerId);

        assertThat(result).isFalse();
        verify(saveRentalRequestPort).save(any());
        verify(saveDepositPort).save(any());
    }

    @Test
    void cancelBooking_fromAllowedState_cancels() {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        // roomId=null so loadRoomPort is never called
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.REQUESTED, null, null);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));
        when(saveRentalRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(loadDepositPort.loadAll()).thenReturn(List.of());

        MyBooking result = myBookingService.cancelBooking(bookingId, customerId);

        assertThat(result.getStatus()).isEqualTo("cancelled");
        verify(saveRentalRequestPort).save(any());
    }

    @Test
    void cancelBooking_fromDisallowedState_throwsConflict() {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.COMPLETED, null, null);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));

        assertThatThrownBy(() -> myBookingService.cancelBooking(bookingId, customerId))
                .isInstanceOf(ConflictException.class);

        verify(saveRentalRequestPort, never()).save(any());
    }

    @Test
    void submitProof_existingDeposit_updatesProofUrl() {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        UUID depositId = UUID.randomUUID();
        String proofUrl = "https://cdn.example.com/proof.jpg";
        // roomId=null so loadRoomPort is never called
        RentalRequest req = rentalRequest(bookingId, customerId, RentalRequestStatus.DEPOSIT_PENDING, null, null);
        DepositRequest existingDeposit = deposit(depositId, bookingId, DepositStatus.PENDING);

        when(loadRentalRequestPort.loadById(bookingId)).thenReturn(Optional.of(req));
        when(loadDepositPort.loadAll()).thenReturn(List.of(existingDeposit));
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MyBooking result = myBookingService.submitProof(bookingId, customerId, proofUrl);

        assertThat(result).isNotNull();
        assertThat(result.getDepositId()).isEqualTo(depositId);
        verify(saveDepositPort).save(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RentalRequest rentalRequest(
            UUID id, UUID customerId, RentalRequestStatus status, UUID roomId, UUID bedId) {
        return new RentalRequest(
                id, customerId, null, roomId, bedId, null, null, null,
                1, null, status, Instant.now(), Instant.now());
    }

    private Room room(UUID id, RoomStatus status) {
        return new Room(id, UUID.randomUUID(), "101", "SINGLE", 2,
                BigDecimal.valueOf(2000000), List.of(), List.of(), status,
                Instant.now(), Instant.now());
    }

    private Bed bed(UUID id, BedStatus status) {
        return new Bed(id, UUID.randomUUID(), "A1", BigDecimal.valueOf(1000000),
                status, Instant.now(), Instant.now());
    }

    private DepositRequest deposit(UUID id, UUID rentalRequestId, DepositStatus status) {
        return new DepositRequest(
                id, rentalRequestId, UUID.randomUUID(), UUID.randomUUID(), null,
                BigDecimal.valueOf(4000000), Instant.now().plusSeconds(86400),
                null, null, null, null, status, Instant.now(), Instant.now());
    }
}
