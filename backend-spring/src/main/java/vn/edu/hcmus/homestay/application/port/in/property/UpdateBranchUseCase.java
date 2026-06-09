package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public interface UpdateBranchUseCase {

    Branch updateBranch(UUID id, UpdateBranchCommand command);

    record UpdateBranchCommand(
            String name,
            String address,
            String phone,
            String description,
            String heroImageUrl,
            UUID managerId) {}
}
