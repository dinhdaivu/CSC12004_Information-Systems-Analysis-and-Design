package vn.edu.hcmus.homestay.domain.model.handover;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class HandoverItem {

    private final UUID id;
    private final UUID handoverId;
    private final String itemName;
    private final String itemCondition;
    private final String notes;
    private final Instant createdAt;

    public HandoverItem(
            UUID id,
            UUID handoverId,
            String itemName,
            String itemCondition,
            String notes,
            Instant createdAt) {
        this.id = id;
        this.handoverId = handoverId;
        this.itemName = itemName;
        this.itemCondition = itemCondition;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getHandoverId() {
        return handoverId;
    }

    public String getItemName() {
        return itemName;
    }

    public String getItemCondition() {
        return itemCondition;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
