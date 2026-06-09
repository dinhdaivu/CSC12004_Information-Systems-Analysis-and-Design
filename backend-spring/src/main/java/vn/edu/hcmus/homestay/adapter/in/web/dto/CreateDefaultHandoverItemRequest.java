package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class CreateDefaultHandoverItemRequest {

    @NotBlank
    @JsonProperty("room_type_match")
    private String roomTypeMatch;

    @NotBlank
    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("default_condition")
    private String defaultCondition;

    @JsonProperty("sort_order")
    private int sortOrder;

    public String getRoomTypeMatch() { return roomTypeMatch; }
    public void setRoomTypeMatch(String roomTypeMatch) { this.roomTypeMatch = roomTypeMatch; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getDefaultCondition() { return defaultCondition; }
    public void setDefaultCondition(String defaultCondition) { this.defaultCondition = defaultCondition; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
