package vn.edu.hcmus.homestay.adapter.out.persistence.eligibility;
import vn.edu.hcmus.homestay.adapter.out.persistence.property.StringListConverter;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lodging_eligibility", schema = "public")
public class LodgingEligibilityEntity extends BaseEntity {

    @Column(name = "customer_id", unique = true)
    private UUID customerId;

    @Column(name = "checked_by", nullable = false)
    private UUID checkedBy;

    @Column(name = "identity_verified", nullable = false)
    private boolean identityVerified;

    @Column(name = "documents_complete", nullable = false)
    private boolean documentsComplete;

    @Column(name = "background_check_passed", nullable = false)
    private boolean backgroundCheckPassed;

    @Column(name = "health_requirements_met")
    private Boolean healthRequirementsMet;

    @Column(name = "decision", nullable = false)
    private String decision;

    @Convert(converter = StringListConverter.class)
    @Column(name = "reasons", columnDefinition = "text")
    private List<String> reasons;

    @Column(name = "notes")
    private String notes;

    @Column(name = "checked_at", nullable = false)
    private Instant checkedAt;

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getCheckedBy() {
        return checkedBy;
    }

    public void setCheckedBy(UUID checkedBy) {
        this.checkedBy = checkedBy;
    }

    public boolean isIdentityVerified() {
        return identityVerified;
    }

    public void setIdentityVerified(boolean identityVerified) {
        this.identityVerified = identityVerified;
    }

    public boolean isDocumentsComplete() {
        return documentsComplete;
    }

    public void setDocumentsComplete(boolean documentsComplete) {
        this.documentsComplete = documentsComplete;
    }

    public boolean isBackgroundCheckPassed() {
        return backgroundCheckPassed;
    }

    public void setBackgroundCheckPassed(boolean backgroundCheckPassed) {
        this.backgroundCheckPassed = backgroundCheckPassed;
    }

    public Boolean getHealthRequirementsMet() {
        return healthRequirementsMet;
    }

    public void setHealthRequirementsMet(Boolean healthRequirementsMet) {
        this.healthRequirementsMet = healthRequirementsMet;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(Instant checkedAt) {
        this.checkedAt = checkedAt;
    }
}
