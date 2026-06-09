package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ContractJpaRepository extends JpaRepository<ContractEntity, UUID> {

    List<ContractEntity> findByCustomerId(UUID customerId);
}
