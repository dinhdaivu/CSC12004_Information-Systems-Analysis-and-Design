package vn.edu.hcmus.homestay.application.service.property;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import vn.edu.hcmus.homestay.application.port.in.property.CreateBedUseCase.CreateBedCommand;
import vn.edu.hcmus.homestay.application.port.in.property.UpdateBedUseCase.UpdateBedCommand;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveBedPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@ExtendWith(MockitoExtension.class)
class BedServiceTest {

    @Mock
    private LoadBedPort loadBedPort;

    @Mock
    private SaveBedPort saveBedPort;

    @Mock
    private LoadRoomPort loadRoomPort;

    private BedService service;

    @BeforeEach
    void setUp() {
        service = new BedService(loadBedPort, saveBedPort, loadRoomPort);
    }

    // ── createBed ─────────────────────────────────────────────────────────────

    @Test
    void createBed_roomNotFound_throwsNotFoundException() {
        UUID roomId = UUID.randomUUID();
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createBed(roomId, new CreateBedCommand("B01", BigDecimal.valueOf(3000000))))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void createBed_duplicateBedNumber_throwsConflictException() {
        UUID roomId = UUID.randomUUID();
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room(roomId)));
        when(loadBedPort.existsByRoomIdAndBedNumber(roomId, "B01")).thenReturn(true);

        assertThatThrownBy(() -> service.createBed(roomId, new CreateBedCommand("B01", BigDecimal.valueOf(3000000))))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void createBed_valid_savesBed() {
        UUID roomId = UUID.randomUUID();
        Bed saved = bed(roomId, "B01");
        when(loadRoomPort.loadById(roomId)).thenReturn(Optional.of(room(roomId)));
        when(loadBedPort.existsByRoomIdAndBedNumber(roomId, "B01")).thenReturn(false);
        when(saveBedPort.save(any())).thenReturn(saved);

        Bed result = service.createBed(roomId, new CreateBedCommand("B01", BigDecimal.valueOf(3000000)));

        assertThat(result.getBedNumber()).isEqualTo("B01");
        verify(saveBedPort).save(any(Bed.class));
    }

    // ── getBed ────────────────────────────────────────────────────────────────

    @Test
    void getBed_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadBedPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getBed(id))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getBed_found_returnsBed() {
        UUID id = UUID.randomUUID();
        Bed b = bed(UUID.randomUUID(), "B01");
        when(loadBedPort.loadById(id)).thenReturn(Optional.of(b));

        assertThat(service.getBed(id)).isEqualTo(b);
    }

    // ── deleteBed ─────────────────────────────────────────────────────────────

    @Test
    void deleteBed_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadBedPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteBed(id))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteBed_found_callsDelete() {
        UUID id = UUID.randomUUID();
        when(loadBedPort.loadById(id)).thenReturn(Optional.of(bed(UUID.randomUUID(), "B01")));

        service.deleteBed(id);

        verify(saveBedPort).delete(id);
    }

    // ── updateBed ─────────────────────────────────────────────────────────────

    @Test
    void updateBed_changeStatus_updatesStatus() {
        UUID id = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Bed existing = bed(roomId, "B01");
        Bed updated = new Bed(existing.getId(), roomId, "B01",
                existing.getPricePerMonth(), BedStatus.OCCUPIED,
                existing.getCreatedAt(), existing.getUpdatedAt());

        when(loadBedPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveBedPort.save(any())).thenReturn(updated);

        Bed result = service.updateBed(id, new UpdateBedCommand(null, null, BedStatus.OCCUPIED));

        assertThat(result.getStatus()).isEqualTo(BedStatus.OCCUPIED);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Bed bed(UUID roomId, String bedNumber) {
        return new Bed(UUID.randomUUID(), roomId, bedNumber,
                BigDecimal.valueOf(3000000), BedStatus.AVAILABLE,
                Instant.now(), Instant.now());
    }

    private Room room(UUID id) {
        return new Room(id, UUID.randomUUID(), "101", "SINGLE", 2, BigDecimal.valueOf(5000000),
                null, null, RoomStatus.AVAILABLE, null, Instant.now(), Instant.now());
    }
}
