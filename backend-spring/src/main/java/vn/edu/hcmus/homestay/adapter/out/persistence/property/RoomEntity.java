package vn.edu.hcmus.homestay.adapter.out.persistence.property;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@Entity
@Table(name = "rooms", schema = "public")
public class RoomEntity extends BaseEntity {

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "room_type")
    private String roomType;

    @Column(name = "max_capacity", nullable = false)
    private int maxCapacity;

    @Column(name = "price_per_month", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerMonth;

    @Convert(converter = StringListConverter.class)
    @Column(name = "amenities", columnDefinition = "text")
    private List<String> amenities;

    @Convert(converter = StringListConverter.class)
    @Column(name = "images_url", columnDefinition = "text")
    private List<String> imagesUrl;

    @Convert(converter = RoomStatusConverter.class)
    @Column(name = "status", nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;

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

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }
}
