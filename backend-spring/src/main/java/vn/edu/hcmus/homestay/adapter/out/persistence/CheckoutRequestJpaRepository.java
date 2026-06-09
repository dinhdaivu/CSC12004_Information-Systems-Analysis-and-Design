package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface CheckoutRequestJpaRepository extends JpaRepository<CheckoutRequestEntity, UUID> {

    List<CheckoutRequestEntity> findByCustomerId(UUID customerId);
}
