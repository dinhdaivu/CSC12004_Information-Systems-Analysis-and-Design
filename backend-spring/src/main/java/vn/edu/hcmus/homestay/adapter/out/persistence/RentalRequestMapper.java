package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

@Component
class RentalRequestMapper {

    RentalRequest toDomain(RentalRequestEntity e) {
        return new RentalRequest(
                e.getId(),
                e.getCustomerId(),
                e.getBranchId(),
                e.getRoomId(),
                e.getBedId(),
                e.getPreferredRoomType(),
                e.getBudgetMin(),
                e.getBudgetMax(),
                e.getPeopleCount(),
                e.getNote(),
                e.getStatus(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    RentalRequestEntity toEntity(RentalRequest r) {
        RentalRequestEntity e = new RentalRequestEntity();
        if (r.getId() != null) {
            e.setId(r.getId());
        }
        e.setCustomerId(r.getCustomerId());
        e.setBranchId(r.getBranchId());
        e.setRoomId(r.getRoomId());
        e.setBedId(r.getBedId());
        e.setPreferredRoomType(r.getPreferredRoomType());
        e.setBudgetMin(r.getBudgetMin());
        e.setBudgetMax(r.getBudgetMax());
        e.setPeopleCount(r.getPeopleCount());
        e.setNote(r.getNote());
        e.setStatus(r.getStatus());
        return e;
    }
}
