package vn.edu.hcmus.homestay.application.service.property;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.property.GetZoneUseCase;
import vn.edu.hcmus.homestay.application.port.out.property.LoadZonePort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

@Service
public class ZoneService implements GetZoneUseCase {

    private final LoadZonePort loadZonePort;

    public ZoneService(LoadZonePort loadZonePort) {
        this.loadZonePort = loadZonePort;
    }

    @Override
    public Zone getZone(UUID id) {
        return loadZonePort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Zone not found"));
    }

    @Override
    public List<Zone> listZonesByBranch(UUID branchId) {
        return loadZonePort.loadByBranchId(branchId);
    }
}
