package vn.edu.hcmus.homestay.domain.model.dispute;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Dispute {

    private final UUID id;
    private final UUID settlementId;
    private final UUID checkoutRequestId;
    private final UUID customerId;
    private final String name;
    private final String branch;
    private final String reason;
    private final String evidenceUrl;
    private final DisputeStatus status;
    private final Instant resolvedAt;
    private final UUID resolvedBy;
    private final String resolutionNote;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Dispute(
            UUID id,
            UUID settlementId,
            UUID checkoutRequestId,
            UUID customerId,
            String name,
            String branch,
            String reason,
            String evidenceUrl,
            DisputeStatus status,
            Instant resolvedAt,
            UUID resolvedBy,
            String resolutionNote,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.settlementId = settlementId;
        this.checkoutRequestId = checkoutRequestId;
        this.customerId = customerId;
        this.name = name;
        this.branch = branch;
        this.reason = reason;
        this.evidenceUrl = evidenceUrl;
        this.status = status;
        this.resolvedAt = resolvedAt;
        this.resolvedBy = resolvedBy;
        this.resolutionNote = resolutionNote;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSettlementId() {
        return settlementId;
    }

    public UUID getCheckoutRequestId() {
        return checkoutRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public String getName() {
        return name;
    }

    public String getBranch() {
        return branch;
    }

    public String getReason() {
        return reason;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public DisputeStatus getStatus() {
        return status;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public UUID getResolvedBy() {
        return resolvedBy;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Dispute withStatus(DisputeStatus newStatus) {
        return new Dispute(id, settlementId, checkoutRequestId, customerId, name, branch, reason,
                evidenceUrl, newStatus, resolvedAt, resolvedBy, resolutionNote, createdAt, updatedAt);
    }

    public Dispute withResolution(UUID newResolvedBy, String note, Instant newResolvedAt) {
        return new Dispute(id, settlementId, checkoutRequestId, customerId, name, branch, reason,
                evidenceUrl, status, newResolvedAt, newResolvedBy, note, createdAt, updatedAt);
    }
}
