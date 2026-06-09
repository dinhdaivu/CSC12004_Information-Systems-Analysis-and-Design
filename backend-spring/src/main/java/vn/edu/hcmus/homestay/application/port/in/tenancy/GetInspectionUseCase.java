package vn.edu.hcmus.homestay.application.port.in.tenancy;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

public interface GetInspectionUseCase {

    CheckoutInspection getInspection(UUID checkoutRequestId);
}
