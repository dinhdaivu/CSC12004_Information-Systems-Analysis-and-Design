package vn.edu.hcmus.homestay.adapter.in.web.dto.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.Room;

public class RoomResponse {

    private UUID id;

    @JsonProperty("branch_id")
    private UUID branchId;

    @JsonProperty("room_number")
    private String roomNumber;

    @JsonProperty("room_type")
    private String roomType;

    @JsonProperty("max_capacity")
    private int maxCapacity;

    @JsonProperty("price_per_month")
    private BigDecimal pricePerMonth;

    private List<String> amenities;

    @JsonProperty("images_url")
    private List<String> imagesUrl;

    private String status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static RoomResponse from(Room room) {
        RoomResponse r = new RoomResponse();
        r.id = room.getId();
        r.branchId = room.getBranchId();
        r.roomNumber = room.getRoomNumber();
        r.roomType = room.getRoomType();
        r.maxCapacity = room.getMaxCapacity();
        r.pricePerMonth = room.getPricePerMonth();
        r.amenities = room.getAmenities();
        r.imagesUrl = room.getImagesUrl();
        r.status = room.getStatus() != null ? room.getStatus().name().toLowerCase() : null;
        r.createdAt = room.getCreatedAt();
        r.updatedAt = room.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public BigDecimal getPricePerMonth() {
        return pricePerMonth;
    }

    public void setPricePerMonth(BigDecimal pricePerMonth) {
        this.pricePerMonth = pricePerMonth;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImagesUrl() {
        return imagesUrl;
    }

    public void setImagesUrl(List<String> imagesUrl) {
        this.imagesUrl = imagesUrl;
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
