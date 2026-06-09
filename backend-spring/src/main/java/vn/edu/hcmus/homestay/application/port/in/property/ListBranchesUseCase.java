package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.List;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public interface ListBranchesUseCase {

    List<Branch> listBranches();
}
