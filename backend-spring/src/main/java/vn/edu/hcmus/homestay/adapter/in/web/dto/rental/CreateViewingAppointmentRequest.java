package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public class CreateViewingAppointmentRequest {

    @NotNull
    @JsonProperty("rental_request_id")
    private UUID rentalRequestId;

    @NotNull
    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("sale_id")
    private UUID saleId;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    @NotNull
    @JsonProperty("scheduled_at")
    private Instant scheduledAt;

    public UUID getRentalRequestId() {
        return rentalRequestId;
    }

    public void setRentalRequestId(UUID rentalRequestId) {
        this.rentalRequestId = rentalRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getSaleId() {
        return saleId;
    }

    public void setSaleId(UUID saleId) {
        this.saleId = saleId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public void setBedId(UUID bedId) {
        this.bedId = bedId;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }
}
