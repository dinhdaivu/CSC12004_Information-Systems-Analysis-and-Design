package vn.edu.hcmus.homestay.domain.model.eligibility;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class LodgingEligibility {

    private final UUID id;
    private final UUID customerId;
    private final UUID checkedBy;
    private final boolean identityVerified;
    private final boolean documentsComplete;
    private final boolean backgroundCheckPassed;
    private final Boolean healthRequirementsMet;
    private final String decision;
    private final List<String> reasons;
    private final String notes;
    private final Instant checkedAt;
    private final Instant createdAt;
    private final Instant updatedAt;

    public LodgingEligibility(
            UUID id,
            UUID customerId,
            UUID checkedBy,
            boolean identityVerified,
            boolean documentsComplete,
            boolean backgroundCheckPassed,
            Boolean healthRequirementsMet,
            String decision,
            List<String> reasons,
            String notes,
            Instant checkedAt,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.checkedBy = checkedBy;
        this.identityVerified = identityVerified;
        this.documentsComplete = documentsComplete;
        this.backgroundCheckPassed = backgroundCheckPassed;
        this.healthRequirementsMet = healthRequirementsMet;
        this.decision = decision;
        this.reasons = reasons != null ? List.copyOf(reasons) : List.of();
        this.notes = notes;
        this.checkedAt = checkedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getCheckedBy() {
        return checkedBy;
    }

    public boolean isIdentityVerified() {
        return identityVerified;
    }

    public boolean isDocumentsComplete() {
        return documentsComplete;
    }

    public boolean isBackgroundCheckPassed() {
        return backgroundCheckPassed;
    }

    public Boolean getHealthRequirementsMet() {
        return healthRequirementsMet;
    }

    public String getDecision() {
        return decision;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
