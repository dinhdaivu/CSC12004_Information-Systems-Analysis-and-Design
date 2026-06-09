package vn.edu.hcmus.homestay.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class UpdateDeductionRequest {

    @NotNull
    private BigDecimal deduction;

    public BigDecimal getDeduction() {
        return deduction;
    }

    public void setDeduction(BigDecimal deduction) {
        this.deduction = deduction;
    }
}
