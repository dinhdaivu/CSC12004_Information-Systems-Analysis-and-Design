package vn.edu.hcmus.homestay.application.service.financial;

import java.util.List;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.financial.GetPaymentUseCase;
import vn.edu.hcmus.homestay.application.port.out.financial.LoadPaymentPort;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

@Service
public class PaymentService implements GetPaymentUseCase {

    private final LoadPaymentPort loadPaymentPort;

    public PaymentService(LoadPaymentPort loadPaymentPort) {
        this.loadPaymentPort = loadPaymentPort;
    }

    @Override
    public List<Payment> getAllPayments() {
        return loadPaymentPort.loadAll();
    }
}
