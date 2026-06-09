package vn.edu.hcmus.homestay.application.port.in.dispute;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

public interface CreateDisputeUseCase {

    Dispute createDispute(CreateDisputeCommand cmd);

    record CreateDisputeCommand(
            UUID customerId,
            UUID settlementId,
            UUID checkoutRequestId,
            String name,
            String branch,
            String reason,
            String evidenceUrl) {}
}
