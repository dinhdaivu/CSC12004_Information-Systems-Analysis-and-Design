package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

interface RentalRequestJpaRepository extends JpaRepository<RentalRequestEntity, UUID> {

    List<RentalRequestEntity> findByCustomerId(UUID customerId);

    @Query("SELECT COUNT(r) FROM RentalRequestEntity r WHERE r.status != vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus.CANCELLED")
    long countNonCancelled();

    @Query("SELECT r FROM RentalRequestEntity r ORDER BY r.createdAt DESC")
    List<RentalRequestEntity> findRecent(Pageable pageable);

    List<RentalRequestEntity> findByStatus(RentalRequestStatus status);
}
