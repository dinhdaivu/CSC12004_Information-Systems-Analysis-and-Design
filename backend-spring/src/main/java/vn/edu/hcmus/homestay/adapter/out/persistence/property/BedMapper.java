package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

@Component
class BedMapper {

    Bed toDomain(BedEntity e) {
        return new Bed(
                e.getId(),
                e.getRoomId(),
                e.getBedNumber(),
                e.getPricePerMonth(),
                e.getStatus(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    BedEntity toEntity(Bed b) {
        BedEntity e = new BedEntity();
        if (b.getId() != null) {
            e.setId(b.getId());
        }
        e.setRoomId(b.getRoomId());
        e.setBedNumber(b.getBedNumber());
        e.setPricePerMonth(b.getPricePerMonth());
        e.setStatus(b.getStatus());
        return e;
    }
}
