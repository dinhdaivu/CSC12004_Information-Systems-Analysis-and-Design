package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeyReturnJpaRepository extends JpaRepository<KeyReturnEntity, UUID> {
    List<KeyReturnEntity> findByCheckoutInspectionId(UUID checkoutInspectionId);
}
