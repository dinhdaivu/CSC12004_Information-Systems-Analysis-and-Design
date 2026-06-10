package vn.edu.hcmus.homestay.adapter.out.persistence.rental;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalMode;
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

    @Column(name = "budget_min", precision = 12, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 12, scale = 2)
    private BigDecimal budgetMax;

    @Column(name = "people_count", nullable = false)
    private int peopleCount = 1;

    @Column(name = "note")
    private String note;

    @Convert(converter = RentalRequestStatusConverter.class)
    @Column(name = "status", nullable = false)
    private RentalRequestStatus status = RentalRequestStatus.REQUESTED;

    // ── UC1 enrichment fields (migration 007) ────────────────────────────────

    @Convert(converter = RentalModeConverter.class)
    @Column(name = "rental_mode")
    private RentalMode rentalMode;

    @Column(name = "preferred_gender")
    private String preferredGender;

    @Column(name = "expected_move_in_date", columnDefinition = "date")
    private LocalDate expectedMoveInDate;

    @Column(name = "rental_duration_months")
    private Integer rentalDurationMonths;

    @Column(name = "prefers_quiet", nullable = false)
    private boolean prefersQuiet = false;

    @Column(name = "needs_parking", nullable = false)
    private boolean needsParking = false;

    @Column(name = "needs_air_conditioner", nullable = false)
    private boolean needsAirConditioner = false;

    @Column(name = "schedule_note")
    private String scheduleNote;

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public UUID getBranchId() { return branchId; }
    public void setBranchId(UUID branchId) { this.branchId = branchId; }

    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }

    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }

    public String getPreferredRoomType() { return preferredRoomType; }
    public void setPreferredRoomType(String preferredRoomType) { this.preferredRoomType = preferredRoomType; }

    public BigDecimal getBudgetMin() { return budgetMin; }
    public void setBudgetMin(BigDecimal budgetMin) { this.budgetMin = budgetMin; }

    public BigDecimal getBudgetMax() { return budgetMax; }
    public void setBudgetMax(BigDecimal budgetMax) { this.budgetMax = budgetMax; }

    public int getPeopleCount() { return peopleCount; }
    public void setPeopleCount(int peopleCount) { this.peopleCount = peopleCount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public RentalRequestStatus getStatus() { return status; }
    public void setStatus(RentalRequestStatus status) { this.status = status; }

    public RentalMode getRentalMode() { return rentalMode; }
    public void setRentalMode(RentalMode rentalMode) { this.rentalMode = rentalMode; }

    public String getPreferredGender() { return preferredGender; }
    public void setPreferredGender(String preferredGender) { this.preferredGender = preferredGender; }

    public LocalDate getExpectedMoveInDate() { return expectedMoveInDate; }
    public void setExpectedMoveInDate(LocalDate expectedMoveInDate) { this.expectedMoveInDate = expectedMoveInDate; }

    public Integer getRentalDurationMonths() { return rentalDurationMonths; }
    public void setRentalDurationMonths(Integer rentalDurationMonths) { this.rentalDurationMonths = rentalDurationMonths; }

    public boolean isPrefersQuiet() { return prefersQuiet; }
    public void setPrefersQuiet(boolean prefersQuiet) { this.prefersQuiet = prefersQuiet; }

    public boolean isNeedsParking() { return needsParking; }
    public void setNeedsParking(boolean needsParking) { this.needsParking = needsParking; }

    public boolean isNeedsAirConditioner() { return needsAirConditioner; }
    public void setNeedsAirConditioner(boolean needsAirConditioner) { this.needsAirConditioner = needsAirConditioner; }

    public String getScheduleNote() { return scheduleNote; }
    public void setScheduleNote(String scheduleNote) { this.scheduleNote = scheduleNote; }
}
