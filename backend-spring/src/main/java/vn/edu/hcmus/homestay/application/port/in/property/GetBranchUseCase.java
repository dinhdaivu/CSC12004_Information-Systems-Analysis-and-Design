package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public interface GetBranchUseCase {

    Branch getBranch(UUID id);
}
