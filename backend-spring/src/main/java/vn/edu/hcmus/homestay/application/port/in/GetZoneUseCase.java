package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

public interface GetZoneUseCase {

    Zone getZone(UUID id);

    List<Zone> listZonesByBranch(UUID branchId);
}
