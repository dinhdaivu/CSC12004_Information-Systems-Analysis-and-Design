package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

public class DisputeResponse {

    private UUID id;

    @JsonProperty("settlement_id")
    private UUID settlementId;

    @JsonProperty("checkout_request_id")
    private UUID checkoutRequestId;

    @JsonProperty("customer_id")
    private UUID customerId;

    private String name;

    private String branch;

    private String reason;

    @JsonProperty("evidence_url")
    private String evidenceUrl;

    private String status;

    @JsonProperty("resolved_at")
    private Instant resolvedAt;

    @JsonProperty("resolved_by")
    private UUID resolvedBy;

    @JsonProperty("resolution_note")
    private String resolutionNote;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static DisputeResponse from(Dispute d) {
        DisputeResponse res = new DisputeResponse();
        res.id = d.getId();
        res.settlementId = d.getSettlementId();
        res.checkoutRequestId = d.getCheckoutRequestId();
        res.customerId = d.getCustomerId();
        res.name = d.getName();
        res.branch = d.getBranch();
        res.reason = d.getReason();
        res.evidenceUrl = d.getEvidenceUrl();
        res.status = d.getStatus() != null ? d.getStatus().name().toLowerCase() : null;
        res.resolvedAt = d.getResolvedAt();
        res.resolvedBy = d.getResolvedBy();
        res.resolutionNote = d.getResolutionNote();
        res.createdAt = d.getCreatedAt();
        res.updatedAt = d.getUpdatedAt();
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSettlementId() {
        return settlementId;
    }

    public void setSettlementId(UUID settlementId) {
        this.settlementId = settlementId;
    }

    public UUID getCheckoutRequestId() {
        return checkoutRequestId;
    }

    public void setCheckoutRequestId(UUID checkoutRequestId) {
        this.checkoutRequestId = checkoutRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public UUID getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(UUID resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
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
