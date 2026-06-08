package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;

public interface ConfirmDepositUseCase {

    DepositRequest confirmDeposit(UUID id, ConfirmDepositCommand command);

    record ConfirmDepositCommand(PaymentMethod paymentMethod) {}
}
