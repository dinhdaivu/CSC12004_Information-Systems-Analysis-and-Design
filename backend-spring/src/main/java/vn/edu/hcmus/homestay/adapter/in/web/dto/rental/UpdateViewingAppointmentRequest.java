package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class UpdateViewingAppointmentRequest {

    @JsonProperty("sale_id")
    private UUID saleId;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    @JsonProperty("scheduled_at")
    private Instant scheduledAt;

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
