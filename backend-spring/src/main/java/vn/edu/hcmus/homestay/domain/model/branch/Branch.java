package vn.edu.hcmus.homestay.domain.model.branch;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Branch {

    private final UUID id;
    private final String name;
    private final String address;
    private final String phone;
    private final String description;
    private final String heroImageUrl;
    private final UUID managerId;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Branch(
            UUID id,
            String name,
            String address,
            String phone,
            String description,
            String heroImageUrl,
            UUID managerId,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.description = description;
        this.heroImageUrl = heroImageUrl;
        this.managerId = managerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getDescription() {
        return description;
    }

    public String getHeroImageUrl() {
        return heroImageUrl;
    }

    public UUID getManagerId() {
        return managerId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
