package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

@Component
class BranchMapper {

    Branch toDomain(BranchEntity e) {
        return new Branch(
                e.getId(),
                e.getName(),
                e.getAddress(),
                e.getPhone(),
                e.getDescription(),
                e.getHeroImageUrl(),
                e.getManagerId(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    BranchEntity toEntity(Branch b) {
        BranchEntity e = new BranchEntity();
        if (b.getId() != null) {
            e.setId(b.getId());
        }
        e.setName(b.getName());
        e.setAddress(b.getAddress());
        e.setPhone(b.getPhone());
        e.setDescription(b.getDescription());
        e.setHeroImageUrl(b.getHeroImageUrl());
        e.setManagerId(b.getManagerId());
        return e;
    }
}
