package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

@Component
class RentalRequestPersistenceAdapter implements LoadRentalRequestPort, SaveRentalRequestPort {

    private final RentalRequestJpaRepository jpaRepository;
    private final RentalRequestMapper mapper;

    RentalRequestPersistenceAdapter(
            RentalRequestJpaRepository jpaRepository, RentalRequestMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<RentalRequest> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<RentalRequest> loadByCustomerId(UUID customerId) {
        return jpaRepository.findByCustomerId(customerId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<RentalRequest> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public RentalRequest save(RentalRequest request) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(request)));
    }

    @Override
    public long countNonCancelled() {
        return jpaRepository.countNonCancelled();
    }

    @Override
    public List<RentalRequest> findRecent(int limit) {
        return jpaRepository.findRecent(PageRequest.of(0, limit)).stream()
                .map(mapper::toDomain)
                .toList();
    }
}
