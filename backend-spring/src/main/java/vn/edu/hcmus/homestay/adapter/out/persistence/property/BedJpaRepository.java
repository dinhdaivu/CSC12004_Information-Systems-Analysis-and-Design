package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface BedJpaRepository extends JpaRepository<BedEntity, UUID> {

    List<BedEntity> findByRoomId(UUID roomId);

    boolean existsByRoomIdAndBedNumber(UUID roomId, String bedNumber);
}
