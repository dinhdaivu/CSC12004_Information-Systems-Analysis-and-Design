package vn.edu.hcmus.homestay.domain.model.room;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Room {

    private final UUID id;
    private final UUID branchId;
    private final String roomNumber;
    private final String roomType;
    private final int maxCapacity;
    private final BigDecimal pricePerMonth;
    private final List<String> amenities;
    private final List<String> imagesUrl;
    private final RoomStatus status;
    private final GenderPolicy genderPolicy;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Room(
            UUID id,
            UUID branchId,
            String roomNumber,
            String roomType,
            int maxCapacity,
            BigDecimal pricePerMonth,
            List<String> amenities,
            List<String> imagesUrl,
            RoomStatus status,
            GenderPolicy genderPolicy,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.branchId = branchId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.maxCapacity = maxCapacity;
        this.pricePerMonth = pricePerMonth;
        this.amenities = amenities;
        this.imagesUrl = imagesUrl;
        this.status = status;
        this.genderPolicy = genderPolicy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public BigDecimal getPricePerMonth() {
        return pricePerMonth;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public List<String> getImagesUrl() {
        return imagesUrl;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public GenderPolicy getGenderPolicy() {
        return genderPolicy;
    }

    /** Returns a copy of this room with a new gender policy. */
    public Room withGenderPolicy(GenderPolicy newGenderPolicy) {
        return new Room(
                id, branchId, roomNumber, roomType, maxCapacity,
                pricePerMonth, amenities, imagesUrl, status,
                newGenderPolicy, createdAt, updatedAt);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
