package vn.edu.hcmus.homestay.application.port.in;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;

public interface CreateDepositUseCase {

    DepositRequest createDeposit(CreateDepositCommand command);

    record CreateDepositCommand(
            UUID rentalRequestId,
            UUID customerId,
            UUID roomId,
            UUID bedId,
            BigDecimal amount,
            PaymentMethod paymentMethod,
            String notes) {}
}
