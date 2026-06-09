package vn.edu.hcmus.homestay.application.port.out.financial;

import java.math.BigDecimal;
import java.util.List;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;

public interface LoadPaymentPort {

    List<Payment> loadAll();

    BigDecimal sumCompletedRevenue();

    List<Payment> findRecentCompleted(int limit);
}
