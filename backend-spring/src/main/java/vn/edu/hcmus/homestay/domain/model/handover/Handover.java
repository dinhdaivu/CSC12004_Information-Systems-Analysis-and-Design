package vn.edu.hcmus.homestay.domain.model.handover;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Handover {

    private final UUID id;
    private final UUID contractId;
    private final UUID managerId;
    private final UUID customerId;
    private final Instant handoverAt;
    private final HandoverStatus status;
    private final String notes;
    private final String managerSignatureUrl;
    private final String customerSignatureUrl;
    private final Instant signedAt;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Handover(
            UUID id,
            UUID contractId,
            UUID managerId,
            UUID customerId,
            Instant handoverAt,
            HandoverStatus status,
            String notes,
            String managerSignatureUrl,
            String customerSignatureUrl,
            Instant signedAt,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.contractId = contractId;
        this.managerId = managerId;
        this.customerId = customerId;
        this.handoverAt = handoverAt;
        this.status = status;
        this.notes = notes;
        this.managerSignatureUrl = managerSignatureUrl;
        this.customerSignatureUrl = customerSignatureUrl;
        this.signedAt = signedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getContractId() {
        return contractId;
    }

    public UUID getManagerId() {
        return managerId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public Instant getHandoverAt() {
        return handoverAt;
    }

    public HandoverStatus getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public String getManagerSignatureUrl() {
        return managerSignatureUrl;
    }

    public String getCustomerSignatureUrl() {
        return customerSignatureUrl;
    }

    public Instant getSignedAt() {
        return signedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Handover withStatus(HandoverStatus newStatus) {
        return new Handover(id, contractId, managerId, customerId, handoverAt,
                newStatus, notes, managerSignatureUrl, customerSignatureUrl,
                signedAt, createdAt, updatedAt);
    }

    public Handover withManagerSignatureUrl(String newUrl) {
        return new Handover(id, contractId, managerId, customerId, handoverAt,
                status, notes, newUrl, customerSignatureUrl,
                signedAt, createdAt, updatedAt);
    }

    public Handover withCustomerSignatureUrl(String newUrl) {
        return new Handover(id, contractId, managerId, customerId, handoverAt,
                status, notes, managerSignatureUrl, newUrl,
                signedAt, createdAt, updatedAt);
    }

    public Handover withSignedAt(Instant newSignedAt) {
        return new Handover(id, contractId, managerId, customerId, handoverAt,
                status, notes, managerSignatureUrl, customerSignatureUrl,
                newSignedAt, createdAt, updatedAt);
    }
}
