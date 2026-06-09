package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.property.LoadZonePort;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

@Component
class ZonePersistenceAdapter implements LoadZonePort {

    private final ZoneJpaRepository jpaRepository;
    private final ZoneMapper mapper;

    ZonePersistenceAdapter(ZoneJpaRepository jpaRepository, ZoneMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Zone> loadByBranchId(UUID branchId) {
        return jpaRepository.findByBranchId(branchId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Zone> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
}
