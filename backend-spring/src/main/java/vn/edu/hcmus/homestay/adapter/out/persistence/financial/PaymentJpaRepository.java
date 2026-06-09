package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface PaymentJpaRepository extends JpaRepository<PaymentEntity, UUID> {

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.status = vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus.COMPLETED")
    BigDecimal sumCompletedRevenue();

    @Query("SELECT p FROM PaymentEntity p WHERE p.status = vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus.COMPLETED ORDER BY p.createdAt DESC")
    List<PaymentEntity> findRecentCompleted(Pageable pageable);
}
