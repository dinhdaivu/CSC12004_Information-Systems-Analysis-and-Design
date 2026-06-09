package vn.edu.hcmus.homestay.adapter.in.web.dto.tenancy;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class CreateHandoverRequest {

    @NotNull
    @JsonProperty("contract_id")
    private UUID contractId;

    @JsonProperty("manager_id")
    private UUID managerId;

    @NotNull
    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("handover_at")
    private Instant handoverAt;

    private String notes;

    private List<HandoverItemRequest> items;

    public UUID getContractId() { return contractId; }
    public void setContractId(UUID contractId) { this.contractId = contractId; }

    public UUID getManagerId() { return managerId; }
    public void setManagerId(UUID managerId) { this.managerId = managerId; }

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public Instant getHandoverAt() { return handoverAt; }
    public void setHandoverAt(Instant handoverAt) { this.handoverAt = handoverAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<HandoverItemRequest> getItems() { return items; }
    public void setItems(List<HandoverItemRequest> items) { this.items = items; }
}
