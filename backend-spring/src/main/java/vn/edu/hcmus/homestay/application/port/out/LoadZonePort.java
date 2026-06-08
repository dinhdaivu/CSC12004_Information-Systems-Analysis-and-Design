package vn.edu.hcmus.homestay.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

public interface LoadZonePort {

    List<Zone> loadByBranchId(UUID branchId);

    Optional<Zone> loadById(UUID id);
}
