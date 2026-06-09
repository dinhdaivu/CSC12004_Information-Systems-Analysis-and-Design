package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

@Entity
@Table(name = "settlement_disputes", schema = "public")
public class DisputeEntity extends BaseEntity {

    @Column(name = "settlement_id")
    private UUID settlementId;

    @Column(name = "checkout_request_id")
    private UUID checkoutRequestId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "branch")
    private String branch;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Convert(converter = DisputeStatusConverter.class)
    @Column(name = "status", nullable = false)
    private DisputeStatus status = DisputeStatus.PENDING;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolution_note")
    private String resolutionNote;

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

    public DisputeStatus getStatus() {
        return status;
    }

    public void setStatus(DisputeStatus status) {
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
}
