package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class CreateBedRequest {

    @NotBlank
    @JsonProperty("bed_number")
    private String bedNumber;

    @JsonProperty("price_per_month")
    private BigDecimal pricePerMonth;

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public BigDecimal getPricePerMonth() {
        return pricePerMonth;
    }

    public void setPricePerMonth(BigDecimal pricePerMonth) {
        this.pricePerMonth = pricePerMonth;
    }
}
