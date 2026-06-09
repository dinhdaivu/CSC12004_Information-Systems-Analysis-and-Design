package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CheckEligibilityRequest {

    @NotNull
    @JsonProperty("customer_id")
    private UUID customerId;

    @NotNull
    @JsonProperty("identity_verified")
    private boolean identityVerified;

    @NotNull
    @JsonProperty("documents_complete")
    private boolean documentsComplete;

    @NotNull
    @JsonProperty("background_check_passed")
    private boolean backgroundCheckPassed;

    @JsonProperty("health_requirements_met")
    private Boolean healthRequirementsMet;

    private String notes;

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public boolean isIdentityVerified() { return identityVerified; }
    public void setIdentityVerified(boolean identityVerified) { this.identityVerified = identityVerified; }

    public boolean isDocumentsComplete() { return documentsComplete; }
    public void setDocumentsComplete(boolean documentsComplete) { this.documentsComplete = documentsComplete; }

    public boolean isBackgroundCheckPassed() { return backgroundCheckPassed; }
    public void setBackgroundCheckPassed(boolean backgroundCheckPassed) { this.backgroundCheckPassed = backgroundCheckPassed; }

    public Boolean getHealthRequirementsMet() { return healthRequirementsMet; }
    public void setHealthRequirementsMet(Boolean healthRequirementsMet) { this.healthRequirementsMet = healthRequirementsMet; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
