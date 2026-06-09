package vn.edu.hcmus.homestay.adapter.in.web.dto.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public class UpdateBranchRequest {

    private String name;
    private String address;
    private String phone;
    private String description;

    @JsonProperty("hero_image_url")
    private String heroImageUrl;

    @JsonProperty("manager_id")
    private UUID managerId;

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
}
