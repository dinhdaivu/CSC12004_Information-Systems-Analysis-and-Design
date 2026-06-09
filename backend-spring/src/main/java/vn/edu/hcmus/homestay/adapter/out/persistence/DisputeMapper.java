package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

@Component
class DisputeMapper {

    Dispute toDomain(DisputeEntity e) {
        return new Dispute(
                e.getId(),
                e.getSettlementId(),
                e.getCheckoutRequestId(),
                e.getCustomerId(),
                e.getName(),
                e.getBranch(),
                e.getReason(),
                e.getEvidenceUrl(),
                e.getStatus(),
                e.getResolvedAt(),
                e.getResolvedBy(),
                e.getResolutionNote(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    DisputeEntity toEntity(Dispute d) {
        DisputeEntity e = new DisputeEntity();
        if (d.getId() != null) {
            e.setId(d.getId());
        }
        e.setSettlementId(d.getSettlementId());
        e.setCheckoutRequestId(d.getCheckoutRequestId());
        e.setCustomerId(d.getCustomerId());
        e.setName(d.getName());
        e.setBranch(d.getBranch());
        e.setReason(d.getReason());
        e.setEvidenceUrl(d.getEvidenceUrl());
        e.setStatus(d.getStatus());
        e.setResolvedAt(d.getResolvedAt());
        e.setResolvedBy(d.getResolvedBy());
        e.setResolutionNote(d.getResolutionNote());
        return e;
    }
}
