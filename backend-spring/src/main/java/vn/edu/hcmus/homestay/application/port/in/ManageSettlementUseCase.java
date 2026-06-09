package vn.edu.hcmus.homestay.application.port.in;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface ManageSettlementUseCase {

    Settlement getSettlement(UUID checkoutRequestId);

    Settlement createSettlement(UUID checkoutRequestId, CreateSettlementCommand cmd);

    Settlement updateDeduction(UUID settlementId, BigDecimal deduction);

    Settlement confirmSettlement(UUID settlementId);

    Settlement completeSettlement(UUID settlementId);

    Settlement signSettlement(UUID settlementId, String customerSignatureUrl, UUID callerId, boolean callerIsStaff);

    record CreateSettlementCommand(
            UUID depositRequestId,
            BigDecimal depositTotal,
            BigDecimal deduction,
            PaymentMethod paymentMethod,
            String notes) {}
}
