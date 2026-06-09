package vn.edu.hcmus.homestay.adapter.out.persistence.eligibility;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface LodgingEligibilityJpaRepository extends JpaRepository<LodgingEligibilityEntity, UUID> {

    Optional<LodgingEligibilityEntity> findByCustomerId(UUID customerId);
}
