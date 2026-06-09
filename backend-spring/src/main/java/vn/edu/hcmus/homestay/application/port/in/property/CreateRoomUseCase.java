package vn.edu.hcmus.homestay.application.port.in.property;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;

public interface CreateRoomUseCase {

    Room createRoom(CreateRoomCommand command);

    record CreateRoomCommand(
            UUID branchId,
            String roomNumber,
            String roomType,
            int maxCapacity,
            BigDecimal pricePerMonth,
            List<String> amenities) {}
}
