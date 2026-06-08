package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

@Entity
@Table(name = "rental_requests", schema = "public")
public class RentalRequestEntity extends BaseEntity {

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "bed_id")
    private UUID bedId;

    @Column(name = "preferred_room_type")
    private String preferredRoomType;

    @Column(name = "budget_min", precision = 12, scale = 2, nullable = true)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 12, scale = 2, nullable = true)
    private BigDecimal budgetMax;

    @Column(name = "people_count", nullable = false)
    private int peopleCount = 1;

    @Column(name = "note")
    private String note;

    @Convert(converter = RentalRequestStatusConverter.class)
    @Column(name = "status", nullable = false)
    private RentalRequestStatus status = RentalRequestStatus.REQUESTED;

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

    public RentalRequestStatus getStatus() {
        return status;
    }

    public void setStatus(RentalRequestStatus status) {
        this.status = status;
    }
}
