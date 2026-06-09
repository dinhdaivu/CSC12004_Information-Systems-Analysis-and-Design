package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class CreateContractRequest {

    @NotNull
    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("deposit_request_id")
    private UUID depositRequestId;

    @NotNull
    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    @NotNull
    @JsonProperty("start_date")
    private LocalDate startDate;

    @NotNull
    @JsonProperty("end_date")
    private LocalDate endDate;

    @NotNull
    @JsonProperty("monthly_price")
    private BigDecimal monthlyPrice;

    private String notes;

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public UUID getDepositRequestId() { return depositRequestId; }
    public void setDepositRequestId(UUID depositRequestId) { this.depositRequestId = depositRequestId; }

    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }

    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
