package vn.edu.hcmus.homestay.adapter.in.web.dto.financial;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

public class PaymentResponse {

    private UUID id;

    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("deposit_request_id")
    private UUID depositRequestId;

    @JsonProperty("contract_id")
    private UUID contractId;

    @JsonProperty("settlement_id")
    private UUID settlementId;

    private BigDecimal amount;

    private String type;

    private String status;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("vietqr_reference")
    private String vietqrReference;

    @JsonProperty("proof_image_url")
    private String proofImageUrl;

    private String notes;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static PaymentResponse from(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.id = p.getId();
        r.userId = p.getUserId();
        r.depositRequestId = p.getDepositRequestId();
        r.contractId = p.getContractId();
        r.settlementId = p.getSettlementId();
        r.amount = p.getAmount();
        r.type = p.getType() != null ? p.getType().name().toLowerCase() : null;
        r.status = p.getStatus() != null ? p.getStatus().name().toLowerCase() : null;
        r.paymentMethod = p.getPaymentMethod() != null
                ? p.getPaymentMethod().name().toLowerCase()
                : null;
        r.vietqrReference = p.getVietqrReference();
        r.proofImageUrl = p.getProofImageUrl();
        r.notes = p.getNotes();
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getDepositRequestId() {
        return depositRequestId;
    }

    public void setDepositRequestId(UUID depositRequestId) {
        this.depositRequestId = depositRequestId;
    }

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getSettlementId() {
        return settlementId;
    }

    public void setSettlementId(UUID settlementId) {
        this.settlementId = settlementId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getVietqrReference() {
        return vietqrReference;
    }

    public void setVietqrReference(String vietqrReference) {
        this.vietqrReference = vietqrReference;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }

    public void setProofImageUrl(String proofImageUrl) {
        this.proofImageUrl = proofImageUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
