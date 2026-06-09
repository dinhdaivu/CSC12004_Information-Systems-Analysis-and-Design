package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;

public class CreateSettlementRequest {

    @JsonProperty("deposit_request_id")
    private UUID depositRequestId;

    @NotNull
    @JsonProperty("deposit_total")
    private BigDecimal depositTotal;

    @NotNull
    private BigDecimal deduction = BigDecimal.ZERO;

    @JsonProperty("payment_method")
    private PaymentMethod paymentMethod;

    private String notes;

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

    public BigDecimal getDeduction() {
        return deduction;
    }

    public void setDeduction(BigDecimal deduction) {
        this.deduction = deduction;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
