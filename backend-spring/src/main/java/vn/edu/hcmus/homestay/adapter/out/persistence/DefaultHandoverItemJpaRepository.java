package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface DefaultHandoverItemJpaRepository extends JpaRepository<DefaultHandoverItemEntity, UUID> {

    @Query("SELECT d FROM DefaultHandoverItemEntity d WHERE d.active = true AND (d.roomTypeMatch = :roomType OR d.roomTypeMatch = '*') ORDER BY d.roomTypeMatch DESC, d.sortOrder ASC")
    List<DefaultHandoverItemEntity> resolve(@Param("roomType") String roomType);

    List<DefaultHandoverItemEntity> findAllByOrderBySortOrderAsc();
}
