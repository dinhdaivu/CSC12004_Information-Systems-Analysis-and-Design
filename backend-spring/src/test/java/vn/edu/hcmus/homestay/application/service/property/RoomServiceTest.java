package vn.edu.hcmus.homestay.application.service.property;

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
import vn.edu.hcmus.homestay.application.port.in.property.CreateRoomUseCase.CreateRoomCommand;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveRoomPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private LoadRoomPort loadRoomPort;

    @Mock
    private SaveRoomPort saveRoomPort;

    @Mock
    private LoadBranchPort loadBranchPort;

    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomService = new RoomService(loadRoomPort, saveRoomPort, loadBranchPort);
    }

    // ── getRoom ───────────────────────────────────────────────────────────────

    @Test
    void getRoom_found_returnsRoom() {
        UUID id = UUID.randomUUID();
        UUID branchId = UUID.randomUUID();
        Room expected = room(id, branchId);
        when(loadRoomPort.loadById(id)).thenReturn(Optional.of(expected));

        Room result = roomService.getRoom(id);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void getRoom_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadRoomPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getRoom(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── createRoom ────────────────────────────────────────────────────────────

    @Test
    void createRoom_newRoomNumber_saved() {
        UUID branchId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Branch branch = new Branch(branchId, "Branch A", "123 Street", "0901234567", null, null,
                null, Instant.now(), Instant.now());
        Room saved = room(roomId, branchId);

        when(loadBranchPort.loadById(branchId)).thenReturn(Optional.of(branch));
        when(loadRoomPort.existsByBranchIdAndRoomNumber(branchId, "101")).thenReturn(false);
        when(saveRoomPort.save(any())).thenReturn(saved);

        Room result = roomService.createRoom(
                new CreateRoomCommand(branchId, "101", "SINGLE", 2, BigDecimal.valueOf(3000000), null));

        assertThat(result).isEqualTo(saved);
        verify(saveRoomPort).save(any(Room.class));
    }

    @Test
    void createRoom_branchNotFound_throwsNotFoundException() {
        UUID branchId = UUID.randomUUID();
        when(loadBranchPort.loadById(branchId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.createRoom(
                        new CreateRoomCommand(branchId, "101", "SINGLE", 2, BigDecimal.valueOf(3000000), null)))
                .isInstanceOf(NotFoundException.class);

        verify(saveRoomPort, never()).save(any());
    }

    @Test
    void createRoom_duplicateRoomNumber_throwsConflict() {
        UUID branchId = UUID.randomUUID();
        Branch branch = new Branch(branchId, "Branch A", "123 Street", "0901234567", null, null,
                null, Instant.now(), Instant.now());

        when(loadBranchPort.loadById(branchId)).thenReturn(Optional.of(branch));
        when(loadRoomPort.existsByBranchIdAndRoomNumber(branchId, "101")).thenReturn(true);

        assertThatThrownBy(() -> roomService.createRoom(
                        new CreateRoomCommand(branchId, "101", "SINGLE", 2, BigDecimal.valueOf(3000000), null)))
                .isInstanceOf(ConflictException.class);

        verify(saveRoomPort, never()).save(any());
    }

    // ── deleteRoom ────────────────────────────────────────────────────────────

    @Test
    void deleteRoom_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadRoomPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.deleteRoom(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Room room(UUID id, UUID branchId) {
        return new Room(id, branchId, "101", "SINGLE", 2, BigDecimal.valueOf(3000000),
                List.of(), List.of(), RoomStatus.AVAILABLE, Instant.now(), Instant.now());
    }
}
