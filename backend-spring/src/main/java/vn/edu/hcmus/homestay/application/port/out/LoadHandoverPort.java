package vn.edu.hcmus.homestay.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;

public interface LoadHandoverPort {

    Optional<Handover> loadById(UUID id);

    List<Handover> loadAll();

    List<HandoverItem> loadItemsByHandoverId(UUID handoverId);
}
