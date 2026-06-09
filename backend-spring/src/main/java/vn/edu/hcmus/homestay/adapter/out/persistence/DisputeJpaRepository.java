package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface DisputeJpaRepository extends JpaRepository<DisputeEntity, UUID> {

    List<DisputeEntity> findByCustomerId(UUID customerId);
}
