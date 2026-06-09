package vn.edu.hcmus.homestay.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface LoadSettlementPort {

    Optional<Settlement> loadById(UUID id);

    Optional<Settlement> loadByCheckoutRequestId(UUID checkoutRequestId);
}
