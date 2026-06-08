package vn.edu.hcmus.homestay.domain.model.bed;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Bed {

    private final UUID id;
    private final UUID roomId;
    private final String bedNumber;
    private final BigDecimal pricePerMonth;
    private final BedStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Bed(
            UUID id,
            UUID roomId,
            String bedNumber,
            BigDecimal pricePerMonth,
            BedStatus status,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.roomId = roomId;
        this.bedNumber = bedNumber;
        this.pricePerMonth = pricePerMonth;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public BigDecimal getPricePerMonth() {
        return pricePerMonth;
    }

    public BedStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
