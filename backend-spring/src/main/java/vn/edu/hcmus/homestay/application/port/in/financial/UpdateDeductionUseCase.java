package vn.edu.hcmus.homestay.application.port.in.financial;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface UpdateDeductionUseCase {

    Settlement updateDeduction(UUID settlementId, BigDecimal deduction);
}
