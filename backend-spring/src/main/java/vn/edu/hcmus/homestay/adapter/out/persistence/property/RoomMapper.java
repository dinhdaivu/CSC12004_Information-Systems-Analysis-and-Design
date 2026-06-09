package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.ArrayList;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.room.Room;

@Component
class RoomMapper {

    Room toDomain(RoomEntity e) {
        return new Room(
                e.getId(),
                e.getBranchId(),
                e.getRoomNumber(),
                e.getRoomType(),
                e.getMaxCapacity(),
                e.getPricePerMonth(),
                e.getAmenities() != null ? e.getAmenities() : new ArrayList<>(),
                e.getImagesUrl() != null ? e.getImagesUrl() : new ArrayList<>(),
                e.getStatus(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    RoomEntity toEntity(Room r) {
        RoomEntity e = new RoomEntity();
        if (r.getId() != null) {
            e.setId(r.getId());
        }
        e.setBranchId(r.getBranchId());
        e.setRoomNumber(r.getRoomNumber());
        e.setRoomType(r.getRoomType());
        e.setMaxCapacity(r.getMaxCapacity());
        e.setPricePerMonth(r.getPricePerMonth());
        e.setAmenities(r.getAmenities() != null ? r.getAmenities() : new ArrayList<>());
        e.setImagesUrl(r.getImagesUrl() != null ? r.getImagesUrl() : new ArrayList<>());
        e.setStatus(r.getStatus());
        return e;
    }
}
