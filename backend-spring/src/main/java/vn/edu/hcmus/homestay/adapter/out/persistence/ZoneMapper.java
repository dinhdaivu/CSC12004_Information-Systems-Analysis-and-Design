package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

@Component
class ZoneMapper {

    Zone toDomain(ZoneEntity e) {
        return new Zone(
                e.getId(),
                e.getBranchId(),
                e.getName(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    ZoneEntity toEntity(Zone z) {
        ZoneEntity e = new ZoneEntity();
        if (z.getId() != null) {
            e.setId(z.getId());
        }
        e.setBranchId(z.getBranchId());
        e.setName(z.getName());
        return e;
    }
}
