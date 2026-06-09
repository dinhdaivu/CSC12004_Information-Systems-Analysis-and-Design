package vn.edu.hcmus.homestay.adapter.in.web.dto.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

public class BedResponse {

    private UUID id;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_number")
    private String bedNumber;

    @JsonProperty("price_per_month")
    private BigDecimal pricePerMonth;

    private String status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static BedResponse from(Bed bed) {
        BedResponse r = new BedResponse();
        r.id = bed.getId();
        r.roomId = bed.getRoomId();
        r.bedNumber = bed.getBedNumber();
        r.pricePerMonth = bed.getPricePerMonth();
        r.status = bed.getStatus() != null ? bed.getStatus().name().toLowerCase() : null;
        r.createdAt = bed.getCreatedAt();
        r.updatedAt = bed.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
