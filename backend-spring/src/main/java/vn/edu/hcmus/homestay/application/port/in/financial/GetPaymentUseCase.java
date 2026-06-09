package vn.edu.hcmus.homestay.application.port.in.financial;

import java.util.List;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

public interface GetPaymentUseCase {

    List<Payment> getAllPayments();
}
