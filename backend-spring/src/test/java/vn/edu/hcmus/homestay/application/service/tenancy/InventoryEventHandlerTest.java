package vn.edu.hcmus.homestay.application.service.tenancy;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveRoomPort;
import vn.edu.hcmus.homestay.domain.event.CheckoutCompletedEvent;
import vn.edu.hcmus.homestay.domain.event.DepositConfirmedEvent;
import vn.edu.hcmus.homestay.domain.event.DepositExpiredEvent;
import vn.edu.hcmus.homestay.domain.event.HandoverCompletedEvent;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@ExtendWith(MockitoExtension.class)
class InventoryEventHandlerTest {

    @Mock
    private LoadRoomPort loadRoomPort;

    @Mock
    private SaveRoomPort saveRoomPort;

    @Mock
    private LoadBedPort loadBedPort;

    @Mock
    private SaveBedPort saveBedPort;

    private InventoryEventHandler handler;

    @BeforeEach
    void setUp() {
        handler = new InventoryEventHandler(loadRoomPort, saveRoomPort, loadBedPort, saveBedPort);
    }

    // ── onDepositConfirmed ────────────────────────────────────────────────────

    @Test
    void onDepositConfirmed_setsRoomToDeposited() {
        UUID roomId = UUID.randomUUID();
        UUID bedId = UUID.randomUUID();
        Room room = room(roomId, RoomStatus.AVAILABLE);
        Bed bed = bed(bedId, roomId, BedStatus.AVAILABLE);

        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room));
        when(loadBedPort.loadById(bedId)).thenReturn(Optional.of(bed));

        handler.onDepositConfirmed(new DepositConfirmedEvent(roomId, bedId));

        verify(saveRoomPort).save(any(Room.class));
        verify(saveBedPort).save(any(Bed.class));
    }

    @Test
    void onDepositConfirmed_noBed_onlyUpdatesRoom() {
        UUID roomId = UUID.randomUUID();
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room(roomId, RoomStatus.AVAILABLE)));

        handler.onDepositConfirmed(new DepositConfirmedEvent(roomId, null));

        verify(saveRoomPort).save(any(Room.class));
        verify(saveBedPort, never()).save(any());
    }

    // ── onHandoverCompleted ───────────────────────────────────────────────────

    @Test
    void onHandoverCompleted_setsRoomToOccupied() {
        UUID roomId = UUID.randomUUID();
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room(roomId, RoomStatus.DEPOSITED)));

        handler.onHandoverCompleted(new HandoverCompletedEvent(roomId, null));

        verify(saveRoomPort).save(any(Room.class));
    }

    // ── onCheckoutCompleted ───────────────────────────────────────────────────

    @Test
    void onCheckoutCompleted_setsRoomToAvailable() {
        UUID roomId = UUID.randomUUID();
        UUID bedId = UUID.randomUUID();
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room(roomId, RoomStatus.OCCUPIED)));
        when(loadBedPort.loadById(bedId)).thenReturn(Optional.of(bed(bedId, roomId, BedStatus.OCCUPIED)));

        handler.onCheckoutCompleted(new CheckoutCompletedEvent(roomId, bedId));

        verify(saveRoomPort).save(any(Room.class));
        verify(saveBedPort).save(any(Bed.class));
    }

    // ── onDepositExpired ──────────────────────────────────────────────────────

    @Test
    void onDepositExpired_setsRoomBackToAvailable() {
        UUID roomId = UUID.randomUUID();
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room(roomId, RoomStatus.DEPOSITED)));

        handler.onDepositExpired(new DepositExpiredEvent(roomId, null));

        verify(saveRoomPort).save(any(Room.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Room room(UUID id, RoomStatus status) {
        return new Room(id, UUID.randomUUID(), "101", "SINGLE", 2,
                BigDecimal.valueOf(5000000), null, null, status, null, Instant.now(), Instant.now());
    }

    private Bed bed(UUID id, UUID roomId, BedStatus status) {
        return new Bed(id, roomId, "B01", BigDecimal.valueOf(3000000), status, Instant.now(), Instant.now());
    }
}
