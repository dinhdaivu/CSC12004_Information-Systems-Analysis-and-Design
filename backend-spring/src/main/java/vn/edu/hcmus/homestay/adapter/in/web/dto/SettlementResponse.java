package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public class SettlementResponse {

    private UUID id;

    @JsonProperty("checkout_request_id")
    private UUID checkoutRequestId;

    @JsonProperty("contract_id")
    private UUID contractId;

    @JsonProperty("deposit_request_id")
    private UUID depositRequestId;

    @JsonProperty("deposit_total")
    private BigDecimal depositTotal;

    @JsonProperty("refund_rate")
    private BigDecimal refundRate;

    private BigDecimal deduction;

    @JsonProperty("final_amount")
    private BigDecimal finalAmount;

    @JsonProperty("payment_method")
    private String paymentMethod;

    private String status;

    private String notes;

    @JsonProperty("customer_signature_url")
    private String customerSignatureUrl;

    @JsonProperty("signed_at")
    private Instant signedAt;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static SettlementResponse from(Settlement s) {
        SettlementResponse res = new SettlementResponse();
        res.id = s.getId();
        res.checkoutRequestId = s.getCheckoutRequestId();
        res.contractId = s.getContractId();
        res.depositRequestId = s.getDepositRequestId();
        res.depositTotal = s.getDepositTotal();
        res.refundRate = s.getRefundRate();
        res.deduction = s.getDeduction();
        res.finalAmount = s.getFinalAmount();
        res.paymentMethod = s.getPaymentMethod() != null ? s.getPaymentMethod().name().toLowerCase() : null;
        res.status = s.getStatus() != null ? s.getStatus().name().toLowerCase() : null;
        res.notes = s.getNotes();
        res.customerSignatureUrl = s.getCustomerSignatureUrl();
        res.signedAt = s.getSignedAt();
        res.createdAt = s.getCreatedAt();
        res.updatedAt = s.getUpdatedAt();
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCheckoutRequestId() {
        return checkoutRequestId;
    }

    public void setCheckoutRequestId(UUID checkoutRequestId) {
        this.checkoutRequestId = checkoutRequestId;
    }

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getDepositRequestId() {
        return depositRequestId;
    }

    public void setDepositRequestId(UUID depositRequestId) {
        this.depositRequestId = depositRequestId;
    }

    public BigDecimal getDepositTotal() {
        return depositTotal;
    }

    public void setDepositTotal(BigDecimal depositTotal) {
        this.depositTotal = depositTotal;
    }

    public BigDecimal getRefundRate() {
        return refundRate;
    }

    public void setRefundRate(BigDecimal refundRate) {
        this.refundRate = refundRate;
    }

    public BigDecimal getDeduction() {
        return deduction;
    }

    public void setDeduction(BigDecimal deduction) {
        this.deduction = deduction;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCustomerSignatureUrl() {
        return customerSignatureUrl;
    }

    public void setCustomerSignatureUrl(String customerSignatureUrl) {
        this.customerSignatureUrl = customerSignatureUrl;
    }

    public Instant getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(Instant signedAt) {
        this.signedAt = signedAt;
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
