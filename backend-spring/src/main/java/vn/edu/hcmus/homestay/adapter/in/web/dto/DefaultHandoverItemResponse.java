package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

public class DefaultHandoverItemResponse {

    private UUID id;

    @JsonProperty("room_type_match")
    private String roomTypeMatch;

    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("default_condition")
    private String defaultCondition;

    @JsonProperty("sort_order")
    private int sortOrder;

    private boolean active;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static DefaultHandoverItemResponse from(DefaultHandoverItem d) {
        DefaultHandoverItemResponse r = new DefaultHandoverItemResponse();
        r.id = d.getId();
        r.roomTypeMatch = d.getRoomTypeMatch();
        r.itemName = d.getItemName();
        r.defaultCondition = d.getDefaultCondition();
        r.sortOrder = d.getSortOrder();
        r.active = d.isActive();
        r.createdAt = d.getCreatedAt();
        r.updatedAt = d.getUpdatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getRoomTypeMatch() { return roomTypeMatch; }
    public void setRoomTypeMatch(String roomTypeMatch) { this.roomTypeMatch = roomTypeMatch; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getDefaultCondition() { return defaultCondition; }
    public void setDefaultCondition(String defaultCondition) { this.defaultCondition = defaultCondition; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
