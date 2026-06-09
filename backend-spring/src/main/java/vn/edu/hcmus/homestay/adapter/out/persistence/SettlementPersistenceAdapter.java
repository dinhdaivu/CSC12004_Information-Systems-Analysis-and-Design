package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadSettlementPort;
import vn.edu.hcmus.homestay.application.port.out.SaveSettlementPort;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

@Component
class SettlementPersistenceAdapter implements LoadSettlementPort, SaveSettlementPort {

    private final SettlementJpaRepository jpaRepository;
    private final SettlementMapper mapper;

    SettlementPersistenceAdapter(SettlementJpaRepository jpaRepository, SettlementMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Settlement> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Settlement> loadByCheckoutRequestId(UUID checkoutRequestId) {
        return jpaRepository.findByCheckoutRequestId(checkoutRequestId).map(mapper::toDomain);
    }

    @Override
    public Settlement save(Settlement s) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(s)));
    }
}
