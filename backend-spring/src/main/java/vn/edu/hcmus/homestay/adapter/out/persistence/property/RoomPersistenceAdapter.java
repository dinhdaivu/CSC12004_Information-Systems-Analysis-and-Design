package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveRoomPort;
import vn.edu.hcmus.homestay.domain.model.room.Room;

@Component
class RoomPersistenceAdapter implements LoadRoomPort, SaveRoomPort {

    private final RoomJpaRepository jpaRepository;
    private final RoomMapper mapper;

    RoomPersistenceAdapter(RoomJpaRepository jpaRepository, RoomMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Room> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Room> loadByBranchId(UUID branchId) {
        return jpaRepository.findByBranchId(branchId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Room> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByBranchIdAndRoomNumber(UUID branchId, String roomNumber) {
        return jpaRepository.existsByBranchIdAndRoomNumber(branchId, roomNumber);
    }

    @Override
    public Room save(Room room) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(room)));
    }

    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long countAllRooms() {
        return jpaRepository.countAllRooms();
    }
}
