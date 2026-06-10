package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface DepositRequestJpaRepository extends JpaRepository<DepositRequestEntity, UUID> {

    // Native query required: PostgreSQL won't implicitly cast VARCHAR → deposit_status enum.
    @Query(value = "SELECT * FROM public.deposit_requests WHERE status = CAST(:status AS public.deposit_status) AND due_at < :now", nativeQuery = true)
    List<DepositRequestEntity> findByStatusAndDueAtBefore(@Param("status") String status, @Param("now") Instant now);
}
