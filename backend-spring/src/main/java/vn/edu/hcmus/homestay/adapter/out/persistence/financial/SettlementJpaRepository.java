package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SettlementJpaRepository extends JpaRepository<SettlementEntity, UUID> {

    Optional<SettlementEntity> findByCheckoutRequestId(UUID checkoutRequestId);
}
