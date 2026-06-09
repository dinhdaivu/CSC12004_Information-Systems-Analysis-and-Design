package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface RoomJpaRepository extends JpaRepository<RoomEntity, UUID> {

    List<RoomEntity> findByBranchId(UUID branchId);

    boolean existsByBranchIdAndRoomNumber(UUID branchId, String roomNumber);

    @Query("SELECT COUNT(r) FROM RoomEntity r")
    long countAllRooms();
}
