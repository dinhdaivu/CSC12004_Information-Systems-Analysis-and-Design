package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;

@Component
class HandoverMapper {

    Handover toDomain(HandoverEntity e) {
        return new Handover(
                e.getId(),
                e.getContractId(),
                e.getManagerId(),
                e.getCustomerId(),
                e.getHandoverAt(),
                e.getStatus(),
                e.getNotes(),
                e.getManagerSignatureUrl(),
                e.getCustomerSignatureUrl(),
                e.getSignedAt(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    HandoverEntity toEntity(Handover h) {
        HandoverEntity e = new HandoverEntity();
        if (h.getId() != null) {
            e.setId(h.getId());
        }
        e.setContractId(h.getContractId());
        e.setManagerId(h.getManagerId());
        e.setCustomerId(h.getCustomerId());
        e.setHandoverAt(h.getHandoverAt());
        e.setStatus(h.getStatus());
        e.setNotes(h.getNotes());
        e.setManagerSignatureUrl(h.getManagerSignatureUrl());
        e.setCustomerSignatureUrl(h.getCustomerSignatureUrl());
        e.setSignedAt(h.getSignedAt());
        return e;
    }

    HandoverItem itemToDomain(HandoverItemEntity e) {
        return new HandoverItem(
                e.getId(),
                e.getHandoverId(),
                e.getItemName(),
                e.getItemCondition(),
                e.getNotes(),
                e.getCreatedAt());
    }

    HandoverItemEntity itemToEntity(HandoverItem item) {
        HandoverItemEntity e = new HandoverItemEntity();
        if (item.getId() != null) {
            e.setId(item.getId());
        }
        e.setHandoverId(item.getHandoverId());
        e.setItemName(item.getItemName());
        e.setItemCondition(item.getItemCondition());
        e.setNotes(item.getNotes());
        return e;
    }
}
