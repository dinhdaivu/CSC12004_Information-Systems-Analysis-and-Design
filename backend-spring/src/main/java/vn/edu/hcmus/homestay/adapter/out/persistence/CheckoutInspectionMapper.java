package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

@Component
class CheckoutInspectionMapper {

    CheckoutInspection toDomain(CheckoutInspectionEntity e) {
        return new CheckoutInspection(
                e.getId(),
                e.getCheckoutRequestId(),
                e.getManagerId(),
                e.getInspectedAt(),
                e.getCleanlinessNote(),
                e.getOverallCondition(),
                e.getStatus(),
                e.getNotes(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    CheckoutInspectionEntity toEntity(CheckoutInspection i) {
        CheckoutInspectionEntity e = new CheckoutInspectionEntity();
        if (i.getId() != null) {
            e.setId(i.getId());
        }
        e.setCheckoutRequestId(i.getCheckoutRequestId());
        e.setManagerId(i.getManagerId());
        e.setInspectedAt(i.getInspectedAt());
        e.setCleanlinessNote(i.getCleanlinessNote());
        e.setOverallCondition(i.getOverallCondition());
        e.setStatus(i.getStatus());
        e.setNotes(i.getNotes());
        return e;
    }
}
