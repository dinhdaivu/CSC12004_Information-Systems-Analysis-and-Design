package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface RentalRequestJpaRepository extends JpaRepository<RentalRequestEntity, UUID> {

    List<RentalRequestEntity> findByCustomerId(UUID customerId);

    List<RentalRequestEntity> findAllByIdIn(Collection<UUID> ids);

    // Native queries required: PostgreSQL won't implicitly cast VARCHAR → rental_request_status enum.
    @Query(value = "SELECT COUNT(*) FROM public.rental_requests WHERE status != 'cancelled'::public.rental_request_status", nativeQuery = true)
    long countNonCancelled();

    @Query(value = "SELECT * FROM public.rental_requests ORDER BY created_at DESC LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}", nativeQuery = true)
    List<RentalRequestEntity> findRecent(Pageable pageable);

    @Query(value = "SELECT * FROM public.rental_requests WHERE status = CAST(:status AS public.rental_request_status)", nativeQuery = true)
    List<RentalRequestEntity> findByStatus(@Param("status") String status);
}
