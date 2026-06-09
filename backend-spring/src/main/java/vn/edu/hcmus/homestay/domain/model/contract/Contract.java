package vn.edu.hcmus.homestay.domain.model.contract;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Contract {

    private final UUID id;
    private final UUID customerId;
    private final UUID depositRequestId;
    private final UUID roomId;
    private final UUID bedId;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal monthlyPrice;
    private final ContractStatus status;
    private final String contractDocumentUrl;
    private final String notes;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Contract(
            UUID id,
            UUID customerId,
            UUID depositRequestId,
            UUID roomId,
            UUID bedId,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal monthlyPrice,
            ContractStatus status,
            String contractDocumentUrl,
            String notes,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.depositRequestId = depositRequestId;
        this.roomId = roomId;
        this.bedId = bedId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.monthlyPrice = monthlyPrice;
        this.status = status;
        this.contractDocumentUrl = contractDocumentUrl;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getDepositRequestId() {
        return depositRequestId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public String getContractDocumentUrl() {
        return contractDocumentUrl;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Contract withStatus(ContractStatus newStatus) {
        return new Contract(id, customerId, depositRequestId, roomId, bedId,
                startDate, endDate, monthlyPrice, newStatus,
                contractDocumentUrl, notes, createdAt, updatedAt);
    }

    public Contract withDocumentUrl(String newUrl) {
        return new Contract(id, customerId, depositRequestId, roomId, bedId,
                startDate, endDate, monthlyPrice, status,
                newUrl, notes, createdAt, updatedAt);
    }

    public Contract withNotes(String newNotes) {
        return new Contract(id, customerId, depositRequestId, roomId, bedId,
                startDate, endDate, monthlyPrice, status,
                contractDocumentUrl, newNotes, createdAt, updatedAt);
    }
}
