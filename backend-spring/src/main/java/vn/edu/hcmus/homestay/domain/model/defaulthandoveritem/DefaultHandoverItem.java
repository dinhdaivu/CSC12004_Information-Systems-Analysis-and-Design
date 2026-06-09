package vn.edu.hcmus.homestay.domain.model.defaulthandoveritem;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class DefaultHandoverItem {

    private final UUID id;
    private final String roomTypeMatch;
    private final String itemName;
    private final String defaultCondition;
    private final int sortOrder;
    private final boolean active;
    private final Instant createdAt;
    private final Instant updatedAt;

    public DefaultHandoverItem(
            UUID id,
            String roomTypeMatch,
            String itemName,
            String defaultCondition,
            int sortOrder,
            boolean active,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.roomTypeMatch = roomTypeMatch;
        this.itemName = itemName;
        this.defaultCondition = defaultCondition;
        this.sortOrder = sortOrder;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getRoomTypeMatch() {
        return roomTypeMatch;
    }

    public String getItemName() {
        return itemName;
    }

    public String getDefaultCondition() {
        return defaultCondition;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public DefaultHandoverItem withActive(boolean newActive) {
        return new DefaultHandoverItem(id, roomTypeMatch, itemName, defaultCondition,
                sortOrder, newActive, createdAt, updatedAt);
    }
}
