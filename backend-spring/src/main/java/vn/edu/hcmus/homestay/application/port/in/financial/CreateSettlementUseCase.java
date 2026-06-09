package vn.edu.hcmus.homestay.application.port.in.financial;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface CreateSettlementUseCase {

    Settlement createSettlement(UUID checkoutRequestId, CreateSettlementCommand cmd);

    record CreateSettlementCommand(
            UUID depositRequestId,
            BigDecimal depositTotal,
            BigDecimal deduction,
            PaymentMethod paymentMethod,
            String notes) {}
}
