package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

public interface CheckEligibilityUseCase {

    LodgingEligibility checkEligibility(CheckEligibilityCommand command);

    LodgingEligibility getEligibility(UUID customerId);

    record CheckEligibilityCommand(
            UUID customerId,
            UUID checkedBy,
            boolean identityVerified,
            boolean documentsComplete,
            boolean backgroundCheckPassed,
            Boolean healthRequirementsMet,
            String notes) {}
}
