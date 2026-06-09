package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.financial.LoadPaymentPort;
import vn.edu.hcmus.homestay.application.port.out.financial.SavePaymentPort;
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

    @Override
    public BigDecimal sumCompletedRevenue() {
        return jpaRepository.sumCompletedRevenue();
    }

    @Override
    public List<Payment> findRecentCompleted(int limit) {
        return jpaRepository.findRecentCompleted(PageRequest.of(0, limit)).stream()
                .map(mapper::toDomain)
                .toList();
    }
}
