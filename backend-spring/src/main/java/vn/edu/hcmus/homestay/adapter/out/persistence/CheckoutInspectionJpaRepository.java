package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface CheckoutInspectionJpaRepository extends JpaRepository<CheckoutInspectionEntity, UUID> {

    Optional<CheckoutInspectionEntity> findByCheckoutRequestId(UUID checkoutRequestId);
}
