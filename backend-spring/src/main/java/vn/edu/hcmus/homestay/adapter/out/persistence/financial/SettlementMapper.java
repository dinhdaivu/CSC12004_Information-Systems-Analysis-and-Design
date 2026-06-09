package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

@Component
class SettlementMapper {

    Settlement toDomain(SettlementEntity e) {
        return new Settlement(
                e.getId(),
                e.getCheckoutRequestId(),
                e.getContractId(),
                e.getDepositRequestId(),
                e.getDepositTotal(),
                e.getRefundRate(),
                e.getDeduction(),
                e.getFinalAmount(),
                e.getPaymentMethod(),
                e.getStatus(),
                e.getNotes(),
                e.getCustomerSignatureUrl(),
                e.getSignedAt(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    SettlementEntity toEntity(Settlement s) {
        SettlementEntity e = new SettlementEntity();
        if (s.getId() != null) {
            e.setId(s.getId());
        }
        e.setCheckoutRequestId(s.getCheckoutRequestId());
        e.setContractId(s.getContractId());
        e.setDepositRequestId(s.getDepositRequestId());
        e.setDepositTotal(s.getDepositTotal());
        e.setRefundRate(s.getRefundRate());
        e.setDeduction(s.getDeduction());
        e.setFinalAmount(s.getFinalAmount());
        e.setPaymentMethod(s.getPaymentMethod());
        e.setStatus(s.getStatus());
        e.setNotes(s.getNotes());
        e.setCustomerSignatureUrl(s.getCustomerSignatureUrl());
        e.setSignedAt(s.getSignedAt());
        return e;
    }
}
