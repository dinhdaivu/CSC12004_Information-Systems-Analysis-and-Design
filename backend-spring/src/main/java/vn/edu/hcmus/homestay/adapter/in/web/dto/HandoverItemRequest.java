package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class HandoverItemRequest {

    @NotBlank
    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("item_condition")
    private String itemCondition;

    private String notes;

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
