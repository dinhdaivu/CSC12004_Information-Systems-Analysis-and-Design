package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public interface CreateBranchUseCase {

    Branch createBranch(CreateBranchCommand command);

    record CreateBranchCommand(
            String name,
            String address,
            String phone,
            String description,
            String heroImageUrl,
            UUID managerId) {}
}
