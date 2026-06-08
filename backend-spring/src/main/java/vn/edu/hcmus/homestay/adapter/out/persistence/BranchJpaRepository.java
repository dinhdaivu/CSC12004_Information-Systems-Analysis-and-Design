package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface BranchJpaRepository extends JpaRepository<BranchEntity, UUID> {

    boolean existsByName(String name);
}
