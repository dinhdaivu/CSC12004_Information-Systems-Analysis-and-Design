package vn.edu.hcmus.homestay.adapter.out.persistence.property;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;

@Entity
@Table(name = "beds", schema = "public")
public class BedEntity extends BaseEntity {

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "bed_number", nullable = false)
    private String bedNumber;

    @Column(name = "price_per_month", precision = 12, scale = 2)
    private BigDecimal pricePerMonth;

    @Convert(converter = BedStatusConverter.class)
    @Column(name = "status", nullable = false)
    private BedStatus status = BedStatus.AVAILABLE;

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

    public BedStatus getStatus() {
        return status;
    }

    public void setStatus(BedStatus status) {
        this.status = status;
    }
}
