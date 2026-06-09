package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

public class ContractResponse {

    private UUID id;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("deposit_request_id")
    private UUID depositRequestId;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    @JsonProperty("monthly_price")
    private BigDecimal monthlyPrice;

    private String status;

    @JsonProperty("contract_document_url")
    private String contractDocumentUrl;

    private String notes;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static ContractResponse from(Contract c) {
        ContractResponse r = new ContractResponse();
        r.id = c.getId();
        r.customerId = c.getCustomerId();
        r.depositRequestId = c.getDepositRequestId();
        r.roomId = c.getRoomId();
        r.bedId = c.getBedId();
        r.startDate = c.getStartDate();
        r.endDate = c.getEndDate();
        r.monthlyPrice = c.getMonthlyPrice();
        r.status = c.getStatus() != null ? c.getStatus().name().toLowerCase() : null;
        r.contractDocumentUrl = c.getContractDocumentUrl();
        r.notes = c.getNotes();
        r.createdAt = c.getCreatedAt();
        r.updatedAt = c.getUpdatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public UUID getDepositRequestId() { return depositRequestId; }
    public void setDepositRequestId(UUID depositRequestId) { this.depositRequestId = depositRequestId; }

    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }

    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getContractDocumentUrl() { return contractDocumentUrl; }
    public void setContractDocumentUrl(String contractDocumentUrl) { this.contractDocumentUrl = contractDocumentUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
