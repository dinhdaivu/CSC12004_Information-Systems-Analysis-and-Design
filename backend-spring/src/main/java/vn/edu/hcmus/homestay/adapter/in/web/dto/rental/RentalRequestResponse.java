package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

public class RentalRequestResponse {

    private UUID id;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("branch_id")
    private UUID branchId;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    @JsonProperty("preferred_room_type")
    private String preferredRoomType;

    @JsonProperty("budget_min")
    private BigDecimal budgetMin;

    @JsonProperty("budget_max")
    private BigDecimal budgetMax;

    @JsonProperty("people_count")
    private int peopleCount;

    private String note;

    private String status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static RentalRequestResponse from(RentalRequest req) {
        RentalRequestResponse r = new RentalRequestResponse();
        r.id = req.getId();
        r.customerId = req.getCustomerId();
        r.branchId = req.getBranchId();
        r.roomId = req.getRoomId();
        r.bedId = req.getBedId();
        r.preferredRoomType = req.getPreferredRoomType();
        r.budgetMin = req.getBudgetMin();
        r.budgetMax = req.getBudgetMax();
        r.peopleCount = req.getPeopleCount();
        r.note = req.getNote();
        r.status = req.getStatus() != null ? req.getStatus().name().toLowerCase() : null;
        r.createdAt = req.getCreatedAt();
        r.updatedAt = req.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
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

    public String getPreferredRoomType() {
        return preferredRoomType;
    }

    public void setPreferredRoomType(String preferredRoomType) {
        this.preferredRoomType = preferredRoomType;
    }

    public BigDecimal getBudgetMin() {
        return budgetMin;
    }

    public void setBudgetMin(BigDecimal budgetMin) {
        this.budgetMin = budgetMin;
    }

    public BigDecimal getBudgetMax() {
        return budgetMax;
    }

    public void setBudgetMax(BigDecimal budgetMax) {
        this.budgetMax = budgetMax;
    }

    public int getPeopleCount() {
        return peopleCount;
    }

    public void setPeopleCount(int peopleCount) {
        this.peopleCount = peopleCount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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
