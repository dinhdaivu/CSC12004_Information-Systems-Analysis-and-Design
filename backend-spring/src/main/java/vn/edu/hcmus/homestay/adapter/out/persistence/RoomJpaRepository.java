package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface RoomJpaRepository extends JpaRepository<RoomEntity, UUID> {

    List<RoomEntity> findByBranchId(UUID branchId);

    boolean existsByBranchIdAndRoomNumber(UUID branchId, String roomNumber);
}
