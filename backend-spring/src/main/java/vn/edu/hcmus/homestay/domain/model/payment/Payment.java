package vn.edu.hcmus.homestay.domain.model.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Payment {

    private final UUID id;
    private final UUID userId;
    private final UUID depositRequestId;
    private final UUID contractId;
    private final UUID settlementId;
    private final BigDecimal amount;
    private final PaymentType type;
    private final PaymentStatus status;
    private final PaymentMethod paymentMethod;
    private final String vietqrReference;
    private final String proofImageUrl;
    private final String notes;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Payment(
            UUID id,
            UUID userId,
            UUID depositRequestId,
            UUID contractId,
            UUID settlementId,
            BigDecimal amount,
            PaymentType type,
            PaymentStatus status,
            PaymentMethod paymentMethod,
            String vietqrReference,
            String proofImageUrl,
            String notes,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.depositRequestId = depositRequestId;
        this.contractId = contractId;
        this.settlementId = settlementId;
        this.amount = amount;
        this.type = type;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.vietqrReference = vietqrReference;
        this.proofImageUrl = proofImageUrl;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getDepositRequestId() {
        return depositRequestId;
    }

    public UUID getContractId() {
        return contractId;
    }

    public UUID getSettlementId() {
        return settlementId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public PaymentType getType() {
        return type;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public String getVietqrReference() {
        return vietqrReference;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
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
}
