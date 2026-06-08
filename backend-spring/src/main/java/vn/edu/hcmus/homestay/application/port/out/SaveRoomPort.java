package vn.edu.hcmus.homestay.application.port.out;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;

public interface SaveRoomPort {

    Room save(Room room);

    void delete(UUID id);
}
