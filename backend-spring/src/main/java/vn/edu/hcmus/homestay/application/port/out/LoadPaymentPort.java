package vn.edu.hcmus.homestay.application.port.out;

import java.util.List;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

public interface LoadPaymentPort {

    List<Payment> loadAll();
}
