package vn.edu.hcmus.homestay.application.port.in.financial;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface GetSettlementUseCase {

    Settlement getSettlement(UUID checkoutRequestId);
}
