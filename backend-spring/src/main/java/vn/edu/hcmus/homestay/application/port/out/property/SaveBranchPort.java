package vn.edu.hcmus.homestay.application.port.out.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public interface SaveBranchPort {

    Branch save(Branch branch);

    void delete(UUID id);
}
