package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

public class LodgingEligibilityResponse {

    private UUID id;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("checked_by")
    private UUID checkedBy;

    @JsonProperty("identity_verified")
    private boolean identityVerified;

    @JsonProperty("documents_complete")
    private boolean documentsComplete;

    @JsonProperty("background_check_passed")
    private boolean backgroundCheckPassed;

    @JsonProperty("health_requirements_met")
    private Boolean healthRequirementsMet;

    private String decision;

    private List<String> reasons;

    private String notes;

    @JsonProperty("checked_at")
    private Instant checkedAt;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static LodgingEligibilityResponse from(LodgingEligibility e) {
        LodgingEligibilityResponse r = new LodgingEligibilityResponse();
        r.id = e.getId();
        r.customerId = e.getCustomerId();
        r.checkedBy = e.getCheckedBy();
        r.identityVerified = e.isIdentityVerified();
        r.documentsComplete = e.isDocumentsComplete();
        r.backgroundCheckPassed = e.isBackgroundCheckPassed();
        r.healthRequirementsMet = e.getHealthRequirementsMet();
        r.decision = e.getDecision();
        r.reasons = e.getReasons();
        r.notes = e.getNotes();
        r.checkedAt = e.getCheckedAt();
        r.createdAt = e.getCreatedAt();
        r.updatedAt = e.getUpdatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public UUID getCheckedBy() { return checkedBy; }
    public void setCheckedBy(UUID checkedBy) { this.checkedBy = checkedBy; }

    public boolean isIdentityVerified() { return identityVerified; }
    public void setIdentityVerified(boolean identityVerified) { this.identityVerified = identityVerified; }

    public boolean isDocumentsComplete() { return documentsComplete; }
    public void setDocumentsComplete(boolean documentsComplete) { this.documentsComplete = documentsComplete; }

    public boolean isBackgroundCheckPassed() { return backgroundCheckPassed; }
    public void setBackgroundCheckPassed(boolean backgroundCheckPassed) { this.backgroundCheckPassed = backgroundCheckPassed; }

    public Boolean getHealthRequirementsMet() { return healthRequirementsMet; }
    public void setHealthRequirementsMet(Boolean healthRequirementsMet) { this.healthRequirementsMet = healthRequirementsMet; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCheckedAt() { return checkedAt; }
    public void setCheckedAt(Instant checkedAt) { this.checkedAt = checkedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
