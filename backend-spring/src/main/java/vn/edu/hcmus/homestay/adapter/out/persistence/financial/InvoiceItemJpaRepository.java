package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceItemJpaRepository extends JpaRepository<InvoiceItemEntity, UUID> {
    List<InvoiceItemEntity> findByInvoiceId(UUID invoiceId);
}
