package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

public interface ListRoomsUseCase {

    List<Room> listRooms(RoomFilter filter);

    List<Room> listRoomsByBranch(UUID branchId);

    record RoomFilter(UUID branchId, String roomType, RoomStatus status, Integer minCapacity) {}
}
