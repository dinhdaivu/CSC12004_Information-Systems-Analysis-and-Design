package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractServiceJpaRepository extends JpaRepository<ContractServiceEntity, UUID> {
    List<ContractServiceEntity> findByContractId(UUID contractId);
}
