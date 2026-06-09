package vn.edu.hcmus.homestay.application.port.out.tenancy;

import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

public interface LoadInspectionPort {

    Optional<CheckoutInspection> loadByCheckoutRequestId(UUID checkoutRequestId);
}
