package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public class BranchResponse {

    private UUID id;
    private String name;
    private String address;
    private String phone;
    private String description;

    @JsonProperty("hero_image_url")
    private String heroImageUrl;

    @JsonProperty("manager_id")
    private UUID managerId;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static BranchResponse from(Branch branch) {
        BranchResponse r = new BranchResponse();
        r.id = branch.getId();
        r.name = branch.getName();
        r.address = branch.getAddress();
        r.phone = branch.getPhone();
        r.description = branch.getDescription();
        r.heroImageUrl = branch.getHeroImageUrl();
        r.managerId = branch.getManagerId();
        r.createdAt = branch.getCreatedAt();
        r.updatedAt = branch.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHeroImageUrl() {
        return heroImageUrl;
    }

    public void setHeroImageUrl(String heroImageUrl) {
        this.heroImageUrl = heroImageUrl;
    }

    public UUID getManagerId() {
        return managerId;
    }

    public void setManagerId(UUID managerId) {
        this.managerId = managerId;
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
