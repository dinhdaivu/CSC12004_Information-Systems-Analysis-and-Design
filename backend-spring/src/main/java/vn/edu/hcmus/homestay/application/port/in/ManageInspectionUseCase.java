package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

public interface ManageInspectionUseCase {

    CheckoutInspection getInspection(UUID checkoutRequestId);

    CheckoutInspection createInspection(UUID checkoutRequestId, CreateInspectionCommand cmd);

    record CreateInspectionCommand(
            UUID managerId,
            String cleanlinessNote,
            String overallCondition,
            String notes) {}
}
