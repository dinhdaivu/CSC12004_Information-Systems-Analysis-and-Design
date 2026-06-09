package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

@Component
class ContractMapper {

    Contract toDomain(ContractEntity e) {
        return new Contract(
                e.getId(),
                e.getCustomerId(),
                e.getDepositRequestId(),
                e.getRoomId(),
                e.getBedId(),
                e.getStartDate(),
                e.getEndDate(),
                e.getMonthlyPrice(),
                e.getStatus(),
                e.getContractDocumentUrl(),
                e.getNotes(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    ContractEntity toEntity(Contract c) {
        ContractEntity e = new ContractEntity();
        if (c.getId() != null) {
            e.setId(c.getId());
        }
        e.setCustomerId(c.getCustomerId());
        e.setDepositRequestId(c.getDepositRequestId());
        e.setRoomId(c.getRoomId());
        e.setBedId(c.getBedId());
        e.setStartDate(c.getStartDate());
        e.setEndDate(c.getEndDate());
        e.setMonthlyPrice(c.getMonthlyPrice());
        e.setStatus(c.getStatus());
        e.setContractDocumentUrl(c.getContractDocumentUrl());
        e.setNotes(c.getNotes());
        return e;
    }
}
