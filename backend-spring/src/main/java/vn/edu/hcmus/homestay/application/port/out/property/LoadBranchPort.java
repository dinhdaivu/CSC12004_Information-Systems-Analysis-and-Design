package vn.edu.hcmus.homestay.application.port.out.property;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

public interface LoadBranchPort {

    List<Branch> loadAll();

    Optional<Branch> loadById(UUID id);

    boolean existsByName(String name);
}
