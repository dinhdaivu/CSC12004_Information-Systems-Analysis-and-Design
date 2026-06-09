package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.tenancy.LoadHandoverPort;
import vn.edu.hcmus.homestay.application.port.out.tenancy.SaveHandoverPort;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;

@Component
class HandoverPersistenceAdapter implements LoadHandoverPort, SaveHandoverPort {

    private final HandoverJpaRepository handoverJpaRepository;
    private final HandoverItemJpaRepository handoverItemJpaRepository;
    private final HandoverMapper mapper;

    HandoverPersistenceAdapter(
            HandoverJpaRepository handoverJpaRepository,
            HandoverItemJpaRepository handoverItemJpaRepository,
            HandoverMapper mapper) {
        this.handoverJpaRepository = handoverJpaRepository;
        this.handoverItemJpaRepository = handoverItemJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Handover> loadById(UUID id) {
        return handoverJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Handover> loadAll() {
        return handoverJpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<HandoverItem> loadItemsByHandoverId(UUID handoverId) {
        return handoverItemJpaRepository.findByHandoverId(handoverId).stream()
                .map(mapper::itemToDomain)
                .toList();
    }

    @Override
    public Handover save(Handover handover) {
        return mapper.toDomain(handoverJpaRepository.save(mapper.toEntity(handover)));
    }

    @Override
    public HandoverItem saveItem(HandoverItem item) {
        return mapper.itemToDomain(handoverItemJpaRepository.save(mapper.itemToEntity(item)));
    }
}
