package vn.edu.hcmus.homestay.application.port.in.dispute;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

public interface ListDisputesUseCase {

    List<Dispute> listDisputes(UUID callerCustomerId, boolean isStaff);
}
