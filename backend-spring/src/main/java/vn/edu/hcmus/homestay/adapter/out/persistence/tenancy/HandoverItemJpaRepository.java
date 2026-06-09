package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface HandoverItemJpaRepository extends JpaRepository<HandoverItemEntity, UUID> {

    List<HandoverItemEntity> findByHandoverId(UUID handoverId);
}
