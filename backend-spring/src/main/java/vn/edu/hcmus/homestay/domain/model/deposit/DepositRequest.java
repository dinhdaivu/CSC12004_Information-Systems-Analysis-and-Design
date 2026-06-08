package vn.edu.hcmus.homestay.domain.model.deposit;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class DepositRequest {

    private final UUID id;
    private final UUID rentalRequestId;
    private final UUID customerId;
    private final UUID roomId;
    private final UUID bedId;
    private final BigDecimal amount;
    private final Instant dueAt;
    private final Instant paidAt;
    private final String proofImageUrl;
    private final String vietqrReference;
    private final String notes;
    private final DepositStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;

    public DepositRequest(
            UUID id,
            UUID rentalRequestId,
            UUID customerId,
            UUID roomId,
            UUID bedId,
            BigDecimal amount,
            Instant dueAt,
            Instant paidAt,
            String proofImageUrl,
            String vietqrReference,
            String notes,
            DepositStatus status,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.rentalRequestId = rentalRequestId;
        this.customerId = customerId;
        this.roomId = roomId;
        this.bedId = bedId;
        this.amount = amount;
        this.dueAt = dueAt;
        this.paidAt = paidAt;
        this.proofImageUrl = proofImageUrl;
        this.vietqrReference = vietqrReference;
        this.notes = notes;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getRentalRequestId() {
        return rentalRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }

    public String getVietqrReference() {
        return vietqrReference;
    }

    public String getNotes() {
        return notes;
    }

    public DepositStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /** Returns a copy of this deposit with a new status. */
    public DepositRequest withStatus(DepositStatus newStatus) {
        return new DepositRequest(
                id, rentalRequestId, customerId, roomId, bedId,
                amount, dueAt, paidAt, proofImageUrl, vietqrReference,
                notes, newStatus, createdAt, updatedAt);
    }

    /** Returns a copy of this deposit with paidAt set. */
    public DepositRequest withPaid(Instant newPaidAt) {
        return new DepositRequest(
                id, rentalRequestId, customerId, roomId, bedId,
                amount, dueAt, newPaidAt, proofImageUrl, vietqrReference,
                notes, status, createdAt, updatedAt);
    }

    /** Returns a copy of this deposit with proofImageUrl set. */
    public DepositRequest withProofImageUrl(String newProofImageUrl) {
        return new DepositRequest(
                id, rentalRequestId, customerId, roomId, bedId,
                amount, dueAt, paidAt, newProofImageUrl, vietqrReference,
                notes, status, createdAt, updatedAt);
    }

    /** Returns a copy of this deposit with vietqrReference set. */
    public DepositRequest withVietQRReference(String newVietqrReference) {
        return new DepositRequest(
                id, rentalRequestId, customerId, roomId, bedId,
                amount, dueAt, paidAt, proofImageUrl, newVietqrReference,
                notes, status, createdAt, updatedAt);
    }
}
