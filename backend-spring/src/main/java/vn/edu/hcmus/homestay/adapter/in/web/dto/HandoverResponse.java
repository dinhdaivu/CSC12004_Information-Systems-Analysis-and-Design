package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverAggregate;

public class HandoverResponse {

    private UUID id;

    @JsonProperty("contract_id")
    private UUID contractId;

    @JsonProperty("manager_id")
    private UUID managerId;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("customer_name")
    private String customerName;

    @JsonProperty("customer_email")
    private String customerEmail;

    @JsonProperty("manager_name")
    private String managerName;

    @JsonProperty("handover_at")
    private Instant handoverAt;

    private String status;

    private String notes;

    @JsonProperty("manager_signature_url")
    private String managerSignatureUrl;

    @JsonProperty("customer_signature_url")
    private String customerSignatureUrl;

    @JsonProperty("signed_at")
    private Instant signedAt;

    @JsonProperty("contract_room_id")
    private UUID contractRoomId;

    @JsonProperty("contract_bed_id")
    private UUID contractBedId;

    @JsonProperty("contract_start_date")
    private LocalDate contractStartDate;

    @JsonProperty("contract_end_date")
    private LocalDate contractEndDate;

    private List<HandoverItemResponse> items;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static HandoverResponse from(HandoverAggregate agg) {
        HandoverResponse r = new HandoverResponse();
        r.id = agg.getHandover().getId();
        r.contractId = agg.getHandover().getContractId();
        r.managerId = agg.getHandover().getManagerId();
        r.customerId = agg.getHandover().getCustomerId();
        r.customerName = agg.getCustomerName();
        r.customerEmail = agg.getCustomerEmail();
        r.managerName = agg.getManagerName();
        r.handoverAt = agg.getHandover().getHandoverAt();
        r.status = agg.getHandover().getStatus() != null
                ? agg.getHandover().getStatus().name().toLowerCase() : null;
        r.notes = agg.getHandover().getNotes();
        r.managerSignatureUrl = agg.getHandover().getManagerSignatureUrl();
        r.customerSignatureUrl = agg.getHandover().getCustomerSignatureUrl();
        r.signedAt = agg.getHandover().getSignedAt();
        r.contractRoomId = agg.getContractRoomId();
        r.contractBedId = agg.getContractBedId();
        r.contractStartDate = agg.getContractStartDate();
        r.contractEndDate = agg.getContractEndDate();
        r.items = agg.getItems().stream().map(HandoverItemResponse::from).toList();
        r.createdAt = agg.getHandover().getCreatedAt();
        r.updatedAt = agg.getHandover().getUpdatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getContractId() { return contractId; }
    public void setContractId(UUID contractId) { this.contractId = contractId; }

    public UUID getManagerId() { return managerId; }
    public void setManagerId(UUID managerId) { this.managerId = managerId; }

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public Instant getHandoverAt() { return handoverAt; }
    public void setHandoverAt(Instant handoverAt) { this.handoverAt = handoverAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getManagerSignatureUrl() { return managerSignatureUrl; }
    public void setManagerSignatureUrl(String managerSignatureUrl) { this.managerSignatureUrl = managerSignatureUrl; }

    public String getCustomerSignatureUrl() { return customerSignatureUrl; }
    public void setCustomerSignatureUrl(String customerSignatureUrl) { this.customerSignatureUrl = customerSignatureUrl; }

    public Instant getSignedAt() { return signedAt; }
    public void setSignedAt(Instant signedAt) { this.signedAt = signedAt; }

    public UUID getContractRoomId() { return contractRoomId; }
    public void setContractRoomId(UUID contractRoomId) { this.contractRoomId = contractRoomId; }

    public UUID getContractBedId() { return contractBedId; }
    public void setContractBedId(UUID contractBedId) { this.contractBedId = contractBedId; }

    public LocalDate getContractStartDate() { return contractStartDate; }
    public void setContractStartDate(LocalDate contractStartDate) { this.contractStartDate = contractStartDate; }

    public LocalDate getContractEndDate() { return contractEndDate; }
    public void setContractEndDate(LocalDate contractEndDate) { this.contractEndDate = contractEndDate; }

    public List<HandoverItemResponse> getItems() { return items; }
    public void setItems(List<HandoverItemResponse> items) { this.items = items; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
