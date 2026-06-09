package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

public class CheckoutInspectionResponse {

    private UUID id;

    @JsonProperty("checkout_request_id")
    private UUID checkoutRequestId;

    @JsonProperty("manager_id")
    private UUID managerId;

    @JsonProperty("inspected_at")
    private Instant inspectedAt;

    @JsonProperty("cleanliness_note")
    private String cleanlinessNote;

    @JsonProperty("overall_condition")
    private String overallCondition;

    private String status;

    private String notes;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static CheckoutInspectionResponse from(CheckoutInspection i) {
        CheckoutInspectionResponse res = new CheckoutInspectionResponse();
        res.id = i.getId();
        res.checkoutRequestId = i.getCheckoutRequestId();
        res.managerId = i.getManagerId();
        res.inspectedAt = i.getInspectedAt();
        res.cleanlinessNote = i.getCleanlinessNote();
        res.overallCondition = i.getOverallCondition();
        res.status = i.getStatus() != null ? i.getStatus().name().toLowerCase() : null;
        res.notes = i.getNotes();
        res.createdAt = i.getCreatedAt();
        res.updatedAt = i.getUpdatedAt();
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCheckoutRequestId() {
        return checkoutRequestId;
    }

    public void setCheckoutRequestId(UUID checkoutRequestId) {
        this.checkoutRequestId = checkoutRequestId;
    }

    public UUID getManagerId() {
        return managerId;
    }

    public void setManagerId(UUID managerId) {
        this.managerId = managerId;
    }

    public Instant getInspectedAt() {
        return inspectedAt;
    }

    public void setInspectedAt(Instant inspectedAt) {
        this.inspectedAt = inspectedAt;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
