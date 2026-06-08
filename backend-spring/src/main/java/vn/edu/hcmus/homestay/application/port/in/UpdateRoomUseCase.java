package vn.edu.hcmus.homestay.application.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

public interface UpdateRoomUseCase {

    Room updateRoom(UUID id, UpdateRoomCommand command);

    record UpdateRoomCommand(
            String roomNumber,
            String roomType,
            Integer maxCapacity,
            BigDecimal pricePerMonth,
            List<String> amenities,
            RoomStatus status) {}
}
