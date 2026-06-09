package vn.edu.hcmus.homestay.application.port.in.financial;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface SignSettlementUseCase {

    Settlement signSettlement(UUID settlementId, String customerSignatureUrl, UUID callerId, boolean callerIsStaff);
}
