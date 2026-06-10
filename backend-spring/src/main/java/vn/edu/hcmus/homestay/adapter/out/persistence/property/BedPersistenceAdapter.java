package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveBedPort;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

@Component
class BedPersistenceAdapter implements LoadBedPort, SaveBedPort {

    private final BedJpaRepository jpaRepository;
    private final BedMapper mapper;

    BedPersistenceAdapter(BedJpaRepository jpaRepository, BedMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Bed> loadByRoomId(UUID roomId) {
        return jpaRepository.findByRoomId(roomId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Bed> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Bed> loadByIds(Collection<UUID> ids) {
        return jpaRepository.findAllByIdIn(ids).stream().map(mapper::toDomain).toList();
    }

    @Override
    public boolean existsByRoomIdAndBedNumber(UUID roomId, String bedNumber) {
        return jpaRepository.existsByRoomIdAndBedNumber(roomId, bedNumber);
    }

    @Override
    public Bed save(Bed bed) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(bed)));
    }

    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }
}
