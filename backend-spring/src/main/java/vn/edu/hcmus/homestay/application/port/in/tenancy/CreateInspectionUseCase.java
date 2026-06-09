package vn.edu.hcmus.homestay.application.port.in.tenancy;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

public interface CreateInspectionUseCase {

    CheckoutInspection createInspection(UUID checkoutRequestId, CreateInspectionCommand cmd);

    record CreateInspectionCommand(
            UUID managerId,
            String cleanlinessNote,
            String overallCondition,
            String notes) {}
}
