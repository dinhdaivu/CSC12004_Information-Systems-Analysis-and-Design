package vn.edu.hcmus.homestay.domain.model.zone;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class Zone {

    private final UUID id;
    private final UUID branchId;
    private final String name;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Zone(
            UUID id,
            UUID branchId,
            String name,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.branchId = branchId;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public String getName() {
        return name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
