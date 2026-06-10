package vn.edu.hcmus.homestay.application.port.out.property;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;

public interface LoadRoomPort {

    List<Room> loadAll();

    List<Room> loadByBranchId(UUID branchId);

    Optional<Room> loadById(UUID id);

    List<Room> loadByIds(Collection<UUID> ids);

    boolean existsByBranchIdAndRoomNumber(UUID branchId, String roomNumber);

    long countAllRooms();
}
