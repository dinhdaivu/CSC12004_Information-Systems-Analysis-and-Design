package vn.edu.hcmus.homestay.domain.model.settlement;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Settlement {

    private final UUID id;
    private final UUID checkoutRequestId;
    private final UUID contractId;
    private final UUID depositRequestId;
    private final BigDecimal depositTotal;
    private final BigDecimal refundRate;
    private final BigDecimal deduction;
    private final BigDecimal finalAmount;
    private final PaymentMethod paymentMethod;
    private final SettlementStatus status;
    private final String notes;
    private final String customerSignatureUrl;
    private final Instant signedAt;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Settlement(
            UUID id,
            UUID checkoutRequestId,
            UUID contractId,
            UUID depositRequestId,
            BigDecimal depositTotal,
            BigDecimal refundRate,
            BigDecimal deduction,
            BigDecimal finalAmount,
            PaymentMethod paymentMethod,
            SettlementStatus status,
            String notes,
            String customerSignatureUrl,
            Instant signedAt,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.checkoutRequestId = checkoutRequestId;
        this.contractId = contractId;
        this.depositRequestId = depositRequestId;
        this.depositTotal = depositTotal;
        this.refundRate = refundRate;
        this.deduction = deduction;
        this.finalAmount = finalAmount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.notes = notes;
        this.customerSignatureUrl = customerSignatureUrl;
        this.signedAt = signedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCheckoutRequestId() {
        return checkoutRequestId;
    }

    public UUID getContractId() {
        return contractId;
    }

    public UUID getDepositRequestId() {
        return depositRequestId;
    }

    public BigDecimal getDepositTotal() {
        return depositTotal;
    }

    public BigDecimal getRefundRate() {
        return refundRate;
    }

    public BigDecimal getDeduction() {
        return deduction;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public SettlementStatus getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public String getCustomerSignatureUrl() {
        return customerSignatureUrl;
    }

    public Instant getSignedAt() {
        return signedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Settlement withStatus(SettlementStatus newStatus) {
        return new Settlement(id, checkoutRequestId, contractId, depositRequestId,
                depositTotal, refundRate, deduction, finalAmount, paymentMethod,
                newStatus, notes, customerSignatureUrl, signedAt, createdAt, updatedAt);
    }

    public Settlement withDeduction(BigDecimal newDeduction) {
        return new Settlement(id, checkoutRequestId, contractId, depositRequestId,
                depositTotal, refundRate, newDeduction, finalAmount, paymentMethod,
                status, notes, customerSignatureUrl, signedAt, createdAt, updatedAt);
    }

    public Settlement withFinalAmount(BigDecimal newFinalAmount) {
        return new Settlement(id, checkoutRequestId, contractId, depositRequestId,
                depositTotal, refundRate, deduction, newFinalAmount, paymentMethod,
                status, notes, customerSignatureUrl, signedAt, createdAt, updatedAt);
    }

    public Settlement withCustomerSignature(String url) {
        return new Settlement(id, checkoutRequestId, contractId, depositRequestId,
                depositTotal, refundRate, deduction, finalAmount, paymentMethod,
                status, notes, url, signedAt, createdAt, updatedAt);
    }

    public Settlement withSignedAt(Instant newSignedAt) {
        return new Settlement(id, checkoutRequestId, contractId, depositRequestId,
                depositTotal, refundRate, deduction, finalAmount, paymentMethod,
                status, notes, customerSignatureUrl, newSignedAt, createdAt, updatedAt);
    }
}
