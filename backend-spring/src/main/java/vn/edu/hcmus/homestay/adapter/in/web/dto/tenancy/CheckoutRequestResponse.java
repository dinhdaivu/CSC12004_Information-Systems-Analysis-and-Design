package vn.edu.hcmus.homestay.adapter.in.web.dto.tenancy;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

public class CheckoutRequestResponse {

    private UUID id;

    @JsonProperty("contract_id")
    private UUID contractId;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("requested_checkout_date")
    private LocalDate requestedCheckoutDate;

    private String reason;

    private String status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static CheckoutRequestResponse from(CheckoutRequest r) {
        CheckoutRequestResponse res = new CheckoutRequestResponse();
        res.id = r.getId();
        res.contractId = r.getContractId();
        res.customerId = r.getCustomerId();
        res.requestedCheckoutDate = r.getRequestedCheckoutDate();
        res.reason = r.getReason();
        res.status = r.getStatus() != null ? r.getStatus().name().toLowerCase() : null;
        res.createdAt = r.getCreatedAt();
        res.updatedAt = r.getUpdatedAt();
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public LocalDate getRequestedCheckoutDate() {
        return requestedCheckoutDate;
    }

    public void setRequestedCheckoutDate(LocalDate requestedCheckoutDate) {
        this.requestedCheckoutDate = requestedCheckoutDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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
