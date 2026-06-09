package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;

public class HandoverItemResponse {

    private UUID id;

    @JsonProperty("handover_id")
    private UUID handoverId;

    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("item_condition")
    private String itemCondition;

    private String notes;

    @JsonProperty("created_at")
    private Instant createdAt;

    public static HandoverItemResponse from(HandoverItem item) {
        HandoverItemResponse r = new HandoverItemResponse();
        r.id = item.getId();
        r.handoverId = item.getHandoverId();
        r.itemName = item.getItemName();
        r.itemCondition = item.getItemCondition();
        r.notes = item.getNotes();
        r.createdAt = item.getCreatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getHandoverId() { return handoverId; }
    public void setHandoverId(UUID handoverId) { this.handoverId = handoverId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
