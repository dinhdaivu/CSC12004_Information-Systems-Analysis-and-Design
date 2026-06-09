package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;

public class DepositResponse {

    private UUID id;

    @JsonProperty("rental_request_id")
    private UUID rentalRequestId;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    private BigDecimal amount;

    @JsonProperty("due_at")
    private Instant dueAt;

    @JsonProperty("paid_at")
    private Instant paidAt;

    @JsonProperty("proof_image_url")
    private String proofImageUrl;

    @JsonProperty("vietqr_reference")
    private String vietqrReference;

    private String notes;

    private String status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static DepositResponse from(DepositRequest d) {
        DepositResponse r = new DepositResponse();
        r.id = d.getId();
        r.rentalRequestId = d.getRentalRequestId();
        r.customerId = d.getCustomerId();
        r.roomId = d.getRoomId();
        r.bedId = d.getBedId();
        r.amount = d.getAmount();
        r.dueAt = d.getDueAt();
        r.paidAt = d.getPaidAt();
        r.proofImageUrl = d.getProofImageUrl();
        r.vietqrReference = d.getVietqrReference();
        r.notes = d.getNotes();
        r.status = d.getStatus() != null ? d.getStatus().name().toLowerCase() : null;
        r.createdAt = d.getCreatedAt();
        r.updatedAt = d.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
