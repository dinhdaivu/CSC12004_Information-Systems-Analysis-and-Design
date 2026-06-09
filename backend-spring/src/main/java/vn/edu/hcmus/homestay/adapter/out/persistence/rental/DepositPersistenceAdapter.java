package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;

@Component
class DepositPersistenceAdapter implements LoadDepositPort, SaveDepositPort {

    private final DepositRequestJpaRepository jpaRepository;
    private final DepositRequestMapper mapper;

    DepositPersistenceAdapter(DepositRequestJpaRepository jpaRepository, DepositRequestMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<DepositRequest> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<DepositRequest> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<DepositRequest> loadPendingExpired(Instant now) {
        return jpaRepository
                .findByStatusAndDueAtBefore(DepositStatus.PENDING, now)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public DepositRequest save(DepositRequest deposit) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(deposit)));
    }
}
