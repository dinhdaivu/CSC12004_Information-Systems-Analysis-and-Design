package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "default_handover_items", schema = "public")
public class DefaultHandoverItemEntity extends BaseEntity {

    @Column(name = "room_type_match", nullable = false)
    private String roomTypeMatch;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "default_condition", nullable = false)
    private String defaultCondition;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "active", nullable = false)
    private boolean active;

    public String getRoomTypeMatch() {
        return roomTypeMatch;
    }

    public void setRoomTypeMatch(String roomTypeMatch) {
        this.roomTypeMatch = roomTypeMatch;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDefaultCondition() {
        return defaultCondition;
    }

    public void setDefaultCondition(String defaultCondition) {
        this.defaultCondition = defaultCondition;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
