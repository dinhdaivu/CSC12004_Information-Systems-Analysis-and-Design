package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspectionStatus;

@Entity
@Table(name = "checkout_inspections", schema = "public")
public class CheckoutInspectionEntity extends BaseEntity {

    @Column(name = "checkout_request_id", nullable = false, unique = true)
    private UUID checkoutRequestId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "inspected_at", nullable = false)
    private Instant inspectedAt;

    @Column(name = "cleanliness_note")
    private String cleanlinessNote;

    @Column(name = "overall_condition")
    private String overallCondition;

    @Convert(converter = CheckoutInspectionStatusConverter.class)
    @Column(name = "status", nullable = false)
    private CheckoutInspectionStatus status = CheckoutInspectionStatus.PENDING;

    @Column(name = "notes")
    private String notes;

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

    public CheckoutInspectionStatus getStatus() {
        return status;
    }

    public void setStatus(CheckoutInspectionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
