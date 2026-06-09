package vn.edu.hcmus.homestay.adapter.out.persistence.dispute;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.dispute.LoadDisputePort;
import vn.edu.hcmus.homestay.application.port.out.dispute.SaveDisputePort;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

@Component
class DisputePersistenceAdapter implements LoadDisputePort, SaveDisputePort {

    private final DisputeJpaRepository jpaRepository;
    private final DisputeMapper mapper;

    DisputePersistenceAdapter(DisputeJpaRepository jpaRepository, DisputeMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Dispute> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Dispute> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Dispute> loadByCustomerId(UUID customerId) {
        return jpaRepository.findByCustomerId(customerId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Dispute save(Dispute d) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(d)));
    }
}
