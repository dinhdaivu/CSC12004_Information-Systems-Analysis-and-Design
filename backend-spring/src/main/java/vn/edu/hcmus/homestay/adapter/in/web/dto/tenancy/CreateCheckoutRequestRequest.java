package vn.edu.hcmus.homestay.adapter.in.web.dto.tenancy;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public class CreateCheckoutRequestRequest {

    @NotNull
    @JsonProperty("contract_id")
    private UUID contractId;

    @NotNull
    @JsonProperty("requested_checkout_date")
    private LocalDate requestedCheckoutDate;

    private String reason;

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public LocalDate getRequestedCheckoutDate() {
        return requestedCheckoutDate;
    }

    public void setRequestedCheckoutDate(LocalDate requestedCheckoutDate) {
        this.requestedCheckoutDate = requestedCheckoutDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
