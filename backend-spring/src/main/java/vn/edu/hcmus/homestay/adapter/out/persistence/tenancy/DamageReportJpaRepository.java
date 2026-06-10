package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DamageReportJpaRepository extends JpaRepository<DamageReportEntity, UUID> {
    List<DamageReportEntity> findByCheckoutInspectionId(UUID checkoutInspectionId);
}
