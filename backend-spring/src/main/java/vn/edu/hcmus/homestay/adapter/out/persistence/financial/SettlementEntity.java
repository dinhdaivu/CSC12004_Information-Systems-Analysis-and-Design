package vn.edu.hcmus.homestay.adapter.out.persistence.financial;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.settlement.SettlementStatus;

@Entity
@Table(name = "settlements", schema = "public")
public class SettlementEntity extends BaseEntity {

    @Column(name = "checkout_request_id", nullable = false)
    private UUID checkoutRequestId;

    @Column(name = "contract_id", nullable = false)
    private UUID contractId;

    @Column(name = "deposit_request_id")
    private UUID depositRequestId;

    @Column(name = "deposit_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal depositTotal;

    @Column(name = "refund_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal refundRate;

    @Column(name = "deduction", nullable = false, precision = 12, scale = 2)
    private BigDecimal deduction;

    @Column(name = "final_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Convert(converter = PaymentMethodConverter.class)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Convert(converter = SettlementStatusConverter.class)
    @Column(name = "status", nullable = false)
    private SettlementStatus status = SettlementStatus.DRAFT;

    @Column(name = "notes")
    private String notes;

    @Column(name = "customer_signature_url")
    private String customerSignatureUrl;

    @Column(name = "signed_at")
    private Instant signedAt;

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

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public SettlementStatus getStatus() {
        return status;
    }

    public void setStatus(SettlementStatus status) {
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
}
