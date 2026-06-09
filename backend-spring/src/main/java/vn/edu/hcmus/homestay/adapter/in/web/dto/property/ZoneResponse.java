package vn.edu.hcmus.homestay.adapter.in.web.dto.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

public class ZoneResponse {

    private UUID id;

    @JsonProperty("branch_id")
    private UUID branchId;

    private String name;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static ZoneResponse from(Zone zone) {
        ZoneResponse r = new ZoneResponse();
        r.id = zone.getId();
        r.branchId = zone.getBranchId();
        r.name = zone.getName();
        r.createdAt = zone.getCreatedAt();
        r.updatedAt = zone.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
