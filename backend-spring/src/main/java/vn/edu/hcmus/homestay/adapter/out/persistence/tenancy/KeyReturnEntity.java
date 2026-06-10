package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.annotation.CreatedDate;

@Entity
@Table(name = "key_returns", schema = "public")
public class KeyReturnEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "checkout_inspection_id", nullable = false)
    private UUID checkoutInspectionId;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "returned", nullable = false)
    private boolean returned = false;

    @Column(name = "replacement_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal replacementCost;

    @Column(name = "notes")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCheckoutInspectionId() { return checkoutInspectionId; }
    public void setCheckoutInspectionId(UUID checkoutInspectionId) { this.checkoutInspectionId = checkoutInspectionId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public boolean isReturned() { return returned; }
    public void setReturned(boolean returned) { this.returned = returned; }

    public BigDecimal getReplacementCost() { return replacementCost; }
    public void setReplacementCost(BigDecimal replacementCost) { this.replacementCost = replacementCost; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
}
