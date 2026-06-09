package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;

@Entity
@Table(name = "handovers", schema = "public")
public class HandoverEntity extends BaseEntity {

    @Column(name = "contract_id", nullable = false)
    private UUID contractId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "handover_at", nullable = false)
    private Instant handoverAt;

    @Convert(converter = HandoverStatusConverter.class)
    @Column(name = "status", nullable = false)
    private HandoverStatus status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "manager_signature_url")
    private String managerSignatureUrl;

    @Column(name = "customer_signature_url")
    private String customerSignatureUrl;

    @Column(name = "signed_at")
    private Instant signedAt;

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getManagerId() {
        return managerId;
    }

    public void setManagerId(UUID managerId) {
        this.managerId = managerId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public Instant getHandoverAt() {
        return handoverAt;
    }

    public void setHandoverAt(Instant handoverAt) {
        this.handoverAt = handoverAt;
    }

    public HandoverStatus getStatus() {
        return status;
    }

    public void setStatus(HandoverStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getManagerSignatureUrl() {
        return managerSignatureUrl;
    }

    public void setManagerSignatureUrl(String managerSignatureUrl) {
        this.managerSignatureUrl = managerSignatureUrl;
    }

    public String getCustomerSignatureUrl() {
        return customerSignatureUrl;
    }

    public void setCustomerSignatureUrl(String customerSignatureUrl) {
        this.customerSignatureUrl = customerSignatureUrl;
    }

    public Instant getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(Instant signedAt) {
        this.signedAt = signedAt;
    }
}
