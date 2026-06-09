package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadCheckoutRequestPort;
import vn.edu.hcmus.homestay.application.port.out.SaveCheckoutRequestPort;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

@Component
class CheckoutRequestPersistenceAdapter implements LoadCheckoutRequestPort, SaveCheckoutRequestPort {

    private final CheckoutRequestJpaRepository jpaRepository;
    private final CheckoutRequestMapper mapper;

    CheckoutRequestPersistenceAdapter(
            CheckoutRequestJpaRepository jpaRepository, CheckoutRequestMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<CheckoutRequest> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CheckoutRequest> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CheckoutRequest> loadByCustomerId(UUID customerId) {
        return jpaRepository.findByCustomerId(customerId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public CheckoutRequest save(CheckoutRequest r) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(r)));
    }
}
