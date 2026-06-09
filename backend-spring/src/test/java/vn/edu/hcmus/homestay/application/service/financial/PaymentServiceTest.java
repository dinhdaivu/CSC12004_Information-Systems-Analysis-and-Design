package vn.edu.hcmus.homestay.application.service.financial;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.out.financial.LoadPaymentPort;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentType;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private LoadPaymentPort loadPaymentPort;

    private PaymentService service;

    @BeforeEach
    void setUp() {
        service = new PaymentService(loadPaymentPort);
    }

    @Test
    void getAllPayments_returnsAll() {
        List<Payment> payments = List.of(payment(), payment());
        when(loadPaymentPort.loadAll()).thenReturn(payments);

        assertThat(service.getAllPayments()).hasSize(2);
    }

    @Test
    void getAllPayments_empty_returnsEmptyList() {
        when(loadPaymentPort.loadAll()).thenReturn(List.of());

        assertThat(service.getAllPayments()).isEmpty();
    }

    private Payment payment() {
        return new Payment(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("3000000"), PaymentType.DEPOSIT, PaymentStatus.COMPLETED,
                PaymentMethod.TRANSFER, null, null, null, Instant.now(), Instant.now());
    }
}
