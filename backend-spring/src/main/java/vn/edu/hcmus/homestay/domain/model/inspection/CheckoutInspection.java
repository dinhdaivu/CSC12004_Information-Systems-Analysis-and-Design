package vn.edu.hcmus.homestay.domain.model.inspection;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class CheckoutInspection {

    private final UUID id;
    private final UUID checkoutRequestId;
    private final UUID managerId;
    private final Instant inspectedAt;
    private final String cleanlinessNote;
    private final String overallCondition;
    private final CheckoutInspectionStatus status;
    private final String notes;
    private final Instant createdAt;
    private final Instant updatedAt;

    public CheckoutInspection(
            UUID id,
            UUID checkoutRequestId,
            UUID managerId,
            Instant inspectedAt,
            String cleanlinessNote,
            String overallCondition,
            CheckoutInspectionStatus status,
            String notes,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.checkoutRequestId = checkoutRequestId;
        this.managerId = managerId;
        this.inspectedAt = inspectedAt;
        this.cleanlinessNote = cleanlinessNote;
        this.overallCondition = overallCondition;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCheckoutRequestId() {
        return checkoutRequestId;
    }

    public UUID getManagerId() {
        return managerId;
    }

    public Instant getInspectedAt() {
        return inspectedAt;
    }

    public String getCleanlinessNote() {
        return cleanlinessNote;
    }

    public String getOverallCondition() {
        return overallCondition;
    }

    public CheckoutInspectionStatus getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public CheckoutInspection withStatus(CheckoutInspectionStatus newStatus) {
        return new CheckoutInspection(id, checkoutRequestId, managerId, inspectedAt,
                cleanlinessNote, overallCondition, newStatus, notes, createdAt, updatedAt);
    }
}
