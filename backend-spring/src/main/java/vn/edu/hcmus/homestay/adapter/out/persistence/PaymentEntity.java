package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentType;

@Entity
@Table(name = "payments", schema = "public")
public class PaymentEntity extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "deposit_request_id")
    private UUID depositRequestId;

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "settlement_id")
    private UUID settlementId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Convert(converter = PaymentTypeConverter.class)
    @Column(nullable = false)
    private PaymentType type;

    @Convert(converter = PaymentStatusConverter.class)
    @Column(nullable = false)
    private PaymentStatus status;

    @Convert(converter = PaymentMethodConverter.class)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "vietqr_reference")
    private String vietqrReference;

    @Column(name = "proof_image_url")
    private String proofImageUrl;

    @Column
    private String notes;

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

    public PaymentType getType() {
        return type;
    }

    public void setType(PaymentType type) {
        this.type = type;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
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
}
