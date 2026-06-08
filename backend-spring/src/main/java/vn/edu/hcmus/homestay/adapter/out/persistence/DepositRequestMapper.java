package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;

@Component
class DepositRequestMapper {

    DepositRequest toDomain(DepositRequestEntity e) {
        return new DepositRequest(
                e.getId(),
                e.getRentalRequestId(),
                e.getCustomerId(),
                e.getRoomId(),
                e.getBedId(),
                e.getAmount(),
                e.getDueAt(),
                e.getPaidAt(),
                e.getProofImageUrl(),
                e.getVietqrReference(),
                e.getNotes(),
                e.getStatus(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    DepositRequestEntity toEntity(DepositRequest d) {
        DepositRequestEntity e = new DepositRequestEntity();
        if (d.getId() != null) {
            e.setId(d.getId());
        }
        e.setRentalRequestId(d.getRentalRequestId());
        e.setCustomerId(d.getCustomerId());
        e.setRoomId(d.getRoomId());
        e.setBedId(d.getBedId());
        e.setAmount(d.getAmount());
        e.setDueAt(d.getDueAt());
        e.setPaidAt(d.getPaidAt());
        e.setProofImageUrl(d.getProofImageUrl());
        e.setVietqrReference(d.getVietqrReference());
        e.setNotes(d.getNotes());
        e.setStatus(d.getStatus());
        return e;
    }
}
