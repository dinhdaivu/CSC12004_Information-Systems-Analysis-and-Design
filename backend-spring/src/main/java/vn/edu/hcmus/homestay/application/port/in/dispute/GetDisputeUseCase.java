package vn.edu.hcmus.homestay.application.port.in.dispute;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

public interface GetDisputeUseCase {

    Dispute getDispute(UUID id);
}
