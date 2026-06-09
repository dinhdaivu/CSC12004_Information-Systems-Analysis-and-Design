package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.tenancy.LoadInspectionPort;
import vn.edu.hcmus.homestay.application.port.out.tenancy.SaveInspectionPort;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

@Component
class CheckoutInspectionPersistenceAdapter implements LoadInspectionPort, SaveInspectionPort {

    private final CheckoutInspectionJpaRepository jpaRepository;
    private final CheckoutInspectionMapper mapper;

    CheckoutInspectionPersistenceAdapter(
            CheckoutInspectionJpaRepository jpaRepository, CheckoutInspectionMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<CheckoutInspection> loadByCheckoutRequestId(UUID checkoutRequestId) {
        return jpaRepository.findByCheckoutRequestId(checkoutRequestId).map(mapper::toDomain);
    }

    @Override
    public CheckoutInspection save(CheckoutInspection i) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(i)));
    }
}
