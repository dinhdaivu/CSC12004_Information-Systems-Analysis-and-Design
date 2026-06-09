package vn.edu.hcmus.homestay.adapter.out.persistence.rental;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;

@Entity
@Table(name = "deposit_requests", schema = "public")
public class DepositRequestEntity extends BaseEntity {

    @Column(name = "rental_request_id")
    private UUID rentalRequestId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "bed_id")
    private UUID bedId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "proof_image_url")
    private String proofImageUrl;

    @Column(name = "vietqr_reference")
    private String vietqrReference;

    @Column
    private String notes;

    @Convert(converter = DepositStatusConverter.class)
    @Column(nullable = false)
    private DepositStatus status;

    public UUID getRentalRequestId() {
        return rentalRequestId;
    }

    public void setRentalRequestId(UUID rentalRequestId) {
        this.rentalRequestId = rentalRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public void setBedId(UUID bedId) {
        this.bedId = bedId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public void setDueAt(Instant dueAt) {
        this.dueAt = dueAt;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }

    public void setProofImageUrl(String proofImageUrl) {
        this.proofImageUrl = proofImageUrl;
    }

    public String getVietqrReference() {
        return vietqrReference;
    }

    public void setVietqrReference(String vietqrReference) {
        this.vietqrReference = vietqrReference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public DepositStatus getStatus() {
        return status;
    }

    public void setStatus(DepositStatus status) {
        this.status = status;
    }
}
