package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadPaymentPort;
import vn.edu.hcmus.homestay.application.port.out.SavePaymentPort;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

@Component
class PaymentPersistenceAdapter implements LoadPaymentPort, SavePaymentPort {

    private final PaymentJpaRepository jpaRepository;
    private final PaymentMapper mapper;

    PaymentPersistenceAdapter(PaymentJpaRepository jpaRepository, PaymentMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Payment> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Payment save(Payment payment) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(payment)));
    }
}
