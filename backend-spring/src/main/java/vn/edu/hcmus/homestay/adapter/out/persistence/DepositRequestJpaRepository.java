package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;

interface DepositRequestJpaRepository extends JpaRepository<DepositRequestEntity, UUID> {

    List<DepositRequestEntity> findByStatusAndDueAtBefore(DepositStatus status, Instant now);
}
