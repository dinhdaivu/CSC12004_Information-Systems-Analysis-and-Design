package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.payment.Payment;

public interface SavePaymentPort {

    Payment save(Payment payment);
}
