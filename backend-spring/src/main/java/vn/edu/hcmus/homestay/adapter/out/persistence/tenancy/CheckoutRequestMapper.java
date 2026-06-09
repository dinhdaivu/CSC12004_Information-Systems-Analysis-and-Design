package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

@Component
class CheckoutRequestMapper {

    CheckoutRequest toDomain(CheckoutRequestEntity e) {
        return new CheckoutRequest(
                e.getId(),
                e.getContractId(),
                e.getCustomerId(),
                e.getRequestedCheckoutDate(),
                e.getReason(),
                e.getStatus(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    CheckoutRequestEntity toEntity(CheckoutRequest r) {
        CheckoutRequestEntity e = new CheckoutRequestEntity();
        if (r.getId() != null) {
            e.setId(r.getId());
        }
        e.setContractId(r.getContractId());
        e.setCustomerId(r.getCustomerId());
        e.setRequestedCheckoutDate(r.getRequestedCheckoutDate());
        e.setReason(r.getReason());
        e.setStatus(r.getStatus());
        return e;
    }
}
