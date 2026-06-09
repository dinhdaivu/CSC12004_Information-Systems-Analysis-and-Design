package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;

public interface GetRoomUseCase {

    Room getRoom(UUID id);
}
