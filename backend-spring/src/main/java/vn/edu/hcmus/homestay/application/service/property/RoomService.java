package vn.edu.hcmus.homestay.application.service.property;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.property.CreateRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.DeleteRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.GetRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.ListRoomsUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.UpdateRoomUseCase;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveRoomPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@Service
public class RoomService
        implements ListRoomsUseCase,
                GetRoomUseCase,
                CreateRoomUseCase,
                UpdateRoomUseCase,
                DeleteRoomUseCase {

    private final LoadRoomPort loadRoomPort;
    private final SaveRoomPort saveRoomPort;
    private final LoadBranchPort loadBranchPort;

    public RoomService(
            LoadRoomPort loadRoomPort,
            SaveRoomPort saveRoomPort,
            LoadBranchPort loadBranchPort) {
        this.loadRoomPort = loadRoomPort;
        this.saveRoomPort = saveRoomPort;
        this.loadBranchPort = loadBranchPort;
    }

    @Override
    public List<Room> listRooms(RoomFilter filter) {
        List<Room> rooms;
        if (filter.branchId() != null) {
            rooms = loadRoomPort.loadByBranchId(filter.branchId());
        } else {
            rooms = loadRoomPort.loadAll();
        }
        return rooms.stream()
                .filter(r -> filter.roomType() == null || filter.roomType().equals(r.getRoomType()))
                .filter(r -> filter.status() == null || filter.status() == r.getStatus())
                .filter(r -> filter.minCapacity() == null || r.getMaxCapacity() >= filter.minCapacity())
                .toList();
    }

    @Override
    public List<Room> listRoomsByBranch(UUID branchId) {
        return loadRoomPort.loadByBranchId(branchId);
    }

    @Override
    public Room getRoom(UUID id) {
        return loadRoomPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Room not found"));
    }

    @Override
    public Room createRoom(CreateRoomCommand command) {
        loadBranchPort
                .loadById(command.branchId())
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        if (loadRoomPort.existsByBranchIdAndRoomNumber(command.branchId(), command.roomNumber())) {
            throw new ConflictException("A room with this number already exists in the branch");
        }

        List<String> amenities =
                command.amenities() != null ? command.amenities() : new ArrayList<>();
        Room room = new Room(
                null,
                command.branchId(),
                command.roomNumber(),
                command.roomType(),
                command.maxCapacity(),
                command.pricePerMonth(),
                amenities,
                new ArrayList<>(),
                RoomStatus.AVAILABLE,
                null,
                null);
        return saveRoomPort.save(room);
    }

    @Override
    public Room updateRoom(UUID id, UpdateRoomCommand command) {
        Room existing = loadRoomPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Room not found"));

        if (command.roomNumber() != null
                && !command.roomNumber().equals(existing.getRoomNumber())
                && loadRoomPort.existsByBranchIdAndRoomNumber(
                        existing.getBranchId(), command.roomNumber())) {
            throw new ConflictException("A room with this number already exists in the branch");
        }

        Room updated = new Room(
                existing.getId(),
                existing.getBranchId(),
                command.roomNumber() != null ? command.roomNumber() : existing.getRoomNumber(),
                command.roomType() != null ? command.roomType() : existing.getRoomType(),
                command.maxCapacity() != null ? command.maxCapacity() : existing.getMaxCapacity(),
                command.pricePerMonth() != null
                        ? command.pricePerMonth()
                        : existing.getPricePerMonth(),
                command.amenities() != null ? command.amenities() : existing.getAmenities(),
                existing.getImagesUrl(),
                command.status() != null ? command.status() : existing.getStatus(),
                existing.getCreatedAt(),
                existing.getUpdatedAt());
        return saveRoomPort.save(updated);
    }

    @Override
    public void deleteRoom(UUID id) {
        loadRoomPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Room not found"));
        saveRoomPort.delete(id);
    }
}
