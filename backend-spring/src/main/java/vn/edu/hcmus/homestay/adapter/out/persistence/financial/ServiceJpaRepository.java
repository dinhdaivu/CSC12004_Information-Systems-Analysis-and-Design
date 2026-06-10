package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceJpaRepository extends JpaRepository<ServiceEntity, UUID> {
}
