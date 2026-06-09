package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.application.model.query.MyBookingView;

public class MyBookingResponse {

    private UUID id;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("branch_name")
    private String branchName;

    @JsonProperty("branch_address")
    private String branchAddress;

    @JsonProperty("room_number")
    private String roomNumber;

    @JsonProperty("room_type")
    private String roomType;

    @JsonProperty("price_per_month")
    private BigDecimal pricePerMonth;

    @JsonProperty("bed_number")
    private String bedNumber;

    @JsonProperty("people_count")
    private int peopleCount;

    private String note;

    private String status;

    @JsonProperty("deposit_id")
    private UUID depositId;

    @JsonProperty("deposit_amount")
    private BigDecimal depositAmount;

    @JsonProperty("deposit_status")
    private String depositStatus;

    @JsonProperty("deposit_due_at")
    private Instant depositDueAt;

    @JsonProperty("vietqr_reference")
    private String vietqrReference;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static MyBookingResponse from(MyBookingView b) {
        MyBookingResponse r = new MyBookingResponse();
        r.id = b.getId();
        r.customerId = b.getCustomerId();
        r.branchName = b.getBranchName();
        r.branchAddress = b.getBranchAddress();
        r.roomNumber = b.getRoomNumber();
        r.roomType = b.getRoomType();
        r.pricePerMonth = b.getPricePerMonth();
        r.bedNumber = b.getBedNumber();
        r.peopleCount = b.getPeopleCount();
        r.note = b.getNote();
        r.status = b.getStatus();
        r.depositId = b.getDepositId();
        r.depositAmount = b.getDepositAmount();
        r.depositStatus = b.getDepositStatus();
        r.depositDueAt = b.getDepositDueAt();
        r.vietqrReference = b.getVietqrReference();
        r.createdAt = b.getCreatedAt();
        r.updatedAt = b.getUpdatedAt();
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

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getBranchAddress() {
        return branchAddress;
    }

    public void setBranchAddress(String branchAddress) {
        this.branchAddress = branchAddress;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public BigDecimal getPricePerMonth() {
        return pricePerMonth;
    }

    public void setPricePerMonth(BigDecimal pricePerMonth) {
        this.pricePerMonth = pricePerMonth;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
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

    public UUID getDepositId() {
        return depositId;
    }

    public void setDepositId(UUID depositId) {
        this.depositId = depositId;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(BigDecimal depositAmount) {
        this.depositAmount = depositAmount;
    }

    public String getDepositStatus() {
        return depositStatus;
    }

    public void setDepositStatus(String depositStatus) {
        this.depositStatus = depositStatus;
    }

    public Instant getDepositDueAt() {
        return depositDueAt;
    }

    public void setDepositDueAt(Instant depositDueAt) {
        this.depositDueAt = depositDueAt;
    }

    public String getVietqrReference() {
        return vietqrReference;
    }

    public void setVietqrReference(String vietqrReference) {
        this.vietqrReference = vietqrReference;
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
