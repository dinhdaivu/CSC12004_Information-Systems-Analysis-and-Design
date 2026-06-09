package vn.edu.hcmus.homestay.application.port.in.dispute;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

public interface ResolveDisputeUseCase {

    Dispute resolveDispute(UUID id, ResolveDisputeCommand cmd);

    record ResolveDisputeCommand(
            UUID resolvedBy,
            DisputeStatus newStatus,
            String resolutionNote) {}
}
