package vn.edu.hcmus.homestay.domain.model.rental;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class RentalRequest {

    private final UUID id;
    private final UUID customerId;
    private final UUID branchId;
    private final UUID roomId;
    private final UUID bedId;
    private final String preferredRoomType;
    private final BigDecimal budgetMin;
    private final BigDecimal budgetMax;
    private final int peopleCount;
    private final String note;
    private final RentalRequestStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;

    public RentalRequest(
            UUID id,
            UUID customerId,
            UUID branchId,
            UUID roomId,
            UUID bedId,
            String preferredRoomType,
            BigDecimal budgetMin,
            BigDecimal budgetMax,
            int peopleCount,
            String note,
            RentalRequestStatus status,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.branchId = branchId;
        this.roomId = roomId;
        this.bedId = bedId;
        this.preferredRoomType = preferredRoomType;
        this.budgetMin = budgetMin;
        this.budgetMax = budgetMax;
        this.peopleCount = peopleCount;
        this.note = note;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public String getPreferredRoomType() {
        return preferredRoomType;
    }

    public BigDecimal getBudgetMin() {
        return budgetMin;
    }

    public BigDecimal getBudgetMax() {
        return budgetMax;
    }

    public int getPeopleCount() {
        return peopleCount;
    }

    public String getNote() {
        return note;
    }

    public RentalRequestStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /** Returns a copy of this request with a new status. */
    public RentalRequest withStatus(RentalRequestStatus newStatus) {
        return new RentalRequest(
                id, customerId, branchId, roomId, bedId,
                preferredRoomType, budgetMin, budgetMax, peopleCount, note,
                newStatus, createdAt, updatedAt);
    }
}
