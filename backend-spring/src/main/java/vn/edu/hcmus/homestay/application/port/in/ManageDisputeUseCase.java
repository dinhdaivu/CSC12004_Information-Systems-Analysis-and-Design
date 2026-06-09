package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

public interface ManageDisputeUseCase {

    List<Dispute> listDisputes(UUID callerCustomerId, boolean isStaff);

    Dispute getDispute(UUID id);

    Dispute createDispute(CreateDisputeCommand cmd);

    Dispute resolveDispute(UUID id, ResolveDisputeCommand cmd);

    record CreateDisputeCommand(
            UUID customerId,
            UUID settlementId,
            UUID checkoutRequestId,
            String name,
            String branch,
            String reason,
            String evidenceUrl) {}

    record ResolveDisputeCommand(
            UUID resolvedBy,
            DisputeStatus newStatus,
            String resolutionNote) {}
}
