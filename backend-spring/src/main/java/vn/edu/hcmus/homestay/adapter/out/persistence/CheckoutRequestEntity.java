package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutStatus;

@Entity
@Table(name = "checkout_requests", schema = "public")
public class CheckoutRequestEntity extends BaseEntity {

    @Column(name = "contract_id", nullable = false)
    private UUID contractId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "requested_checkout_date", nullable = false, columnDefinition = "date")
    private LocalDate requestedCheckoutDate;

    @Column(name = "reason")
    private String reason;

    @Convert(converter = CheckoutStatusConverter.class)
    @Column(name = "status", nullable = false)
    private CheckoutStatus status = CheckoutStatus.REQUESTED;

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public LocalDate getRequestedCheckoutDate() {
        return requestedCheckoutDate;
    }

    public void setRequestedCheckoutDate(LocalDate requestedCheckoutDate) {
        this.requestedCheckoutDate = requestedCheckoutDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public CheckoutStatus getStatus() {
        return status;
    }

    public void setStatus(CheckoutStatus status) {
        this.status = status;
    }
}
