package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ZoneJpaRepository extends JpaRepository<ZoneEntity, UUID> {

    List<ZoneEntity> findByBranchId(UUID branchId);
}
