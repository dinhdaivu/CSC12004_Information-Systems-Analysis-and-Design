package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface BranchJpaRepository extends JpaRepository<BranchEntity, UUID> {

    boolean existsByName(String name);
}
