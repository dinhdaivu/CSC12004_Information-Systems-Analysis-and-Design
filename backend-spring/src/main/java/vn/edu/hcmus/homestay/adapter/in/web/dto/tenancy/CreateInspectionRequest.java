package vn.edu.hcmus.homestay.adapter.in.web.dto.tenancy;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public class CreateInspectionRequest {

    @JsonProperty("manager_id")
    private UUID managerId;

    @JsonProperty("cleanliness_note")
    private String cleanlinessNote;

    @JsonProperty("overall_condition")
    private String overallCondition;

    private String notes;

    public UUID getManagerId() {
        return managerId;
    }

    public void setManagerId(UUID managerId) {
        this.managerId = managerId;
    }

    public String getCleanlinessNote() {
        return cleanlinessNote;
    }

    public void setCleanlinessNote(String cleanlinessNote) {
        this.cleanlinessNote = cleanlinessNote;
    }

    public String getOverallCondition() {
        return overallCondition;
    }

    public void setOverallCondition(String overallCondition) {
        this.overallCondition = overallCondition;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
