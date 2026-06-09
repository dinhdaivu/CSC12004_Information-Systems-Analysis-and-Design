package vn.edu.hcmus.homestay.adapter.in.web.dto.property;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateDefaultHandoverItemRequest {

    @JsonProperty("room_type_match")
    private String roomTypeMatch;

    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("default_condition")
    private String defaultCondition;

    @JsonProperty("sort_order")
    private Integer sortOrder;

    private Boolean active;

    public String getRoomTypeMatch() { return roomTypeMatch; }
    public void setRoomTypeMatch(String roomTypeMatch) { this.roomTypeMatch = roomTypeMatch; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getDefaultCondition() { return defaultCondition; }
    public void setDefaultCondition(String defaultCondition) { this.defaultCondition = defaultCondition; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
