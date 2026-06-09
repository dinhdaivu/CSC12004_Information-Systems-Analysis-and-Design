package vn.edu.hcmus.homestay.application.model.query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Read-only aggregate view of a customer's booking — not a DB table. */
public class MyBookingView {

    private final UUID id;
    private final UUID customerId;
    private final String branchName;
    private final String branchAddress;
    private final String roomNumber;
    private final String roomType;
    private final BigDecimal pricePerMonth;
    private final String bedNumber;
    private final int peopleCount;
    private final String note;
    private final String status;
    private final UUID depositId;
    private final BigDecimal depositAmount;
    private final String depositStatus;
    private final Instant depositDueAt;
    private final String vietqrReference;
    private final Instant createdAt;
    private final Instant updatedAt;

    public MyBookingView(
            UUID id,
            UUID customerId,
            String branchName,
            String branchAddress,
            String roomNumber,
            String roomType,
            BigDecimal pricePerMonth,
            String bedNumber,
            int peopleCount,
            String note,
            String status,
            UUID depositId,
            BigDecimal depositAmount,
            String depositStatus,
            Instant depositDueAt,
            String vietqrReference,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.branchName = branchName;
        this.branchAddress = branchAddress;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerMonth = pricePerMonth;
        this.bedNumber = bedNumber;
        this.peopleCount = peopleCount;
        this.note = note;
        this.status = status;
        this.depositId = depositId;
        this.depositAmount = depositAmount;
        this.depositStatus = depositStatus;
        this.depositDueAt = depositDueAt;
        this.vietqrReference = vietqrReference;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public String getBranchName() {
        return branchName;
    }

    public String getBranchAddress() {
        return branchAddress;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public BigDecimal getPricePerMonth() {
        return pricePerMonth;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public int getPeopleCount() {
        return peopleCount;
    }

    public String getNote() {
        return note;
    }

    public String getStatus() {
        return status;
    }

    public UUID getDepositId() {
        return depositId;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public String getDepositStatus() {
        return depositStatus;
    }

    public Instant getDepositDueAt() {
        return depositDueAt;
    }

    public String getVietqrReference() {
        return vietqrReference;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
