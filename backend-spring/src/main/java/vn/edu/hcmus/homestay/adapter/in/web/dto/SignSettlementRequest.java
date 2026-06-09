package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class SignSettlementRequest {

    @NotBlank
    @JsonProperty("customer_signature_url")
    private String customerSignatureUrl;

    public String getCustomerSignatureUrl() {
        return customerSignatureUrl;
    }

    public void setCustomerSignatureUrl(String customerSignatureUrl) {
        this.customerSignatureUrl = customerSignatureUrl;
    }
}
