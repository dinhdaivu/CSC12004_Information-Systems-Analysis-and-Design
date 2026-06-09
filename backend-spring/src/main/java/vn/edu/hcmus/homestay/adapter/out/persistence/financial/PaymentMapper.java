package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

@Component
class PaymentMapper {

    Payment toDomain(PaymentEntity e) {
        return new Payment(
                e.getId(),
                e.getUserId(),
                e.getDepositRequestId(),
                e.getContractId(),
                e.getSettlementId(),
                e.getAmount(),
                e.getType(),
                e.getStatus(),
                e.getPaymentMethod(),
                e.getVietqrReference(),
                e.getProofImageUrl(),
                e.getNotes(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    PaymentEntity toEntity(Payment p) {
        PaymentEntity e = new PaymentEntity();
        if (p.getId() != null) {
            e.setId(p.getId());
        }
        e.setUserId(p.getUserId());
        e.setDepositRequestId(p.getDepositRequestId());
        e.setContractId(p.getContractId());
        e.setSettlementId(p.getSettlementId());
        e.setAmount(p.getAmount());
        e.setType(p.getType());
        e.setStatus(p.getStatus());
        e.setPaymentMethod(p.getPaymentMethod());
        e.setVietqrReference(p.getVietqrReference());
        e.setProofImageUrl(p.getProofImageUrl());
        e.setNotes(p.getNotes());
        return e;
    }
}
