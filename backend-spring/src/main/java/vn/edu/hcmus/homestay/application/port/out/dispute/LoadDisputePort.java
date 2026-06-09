package vn.edu.hcmus.homestay.application.port.out.dispute;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

public interface LoadDisputePort {

    Optional<Dispute> loadById(UUID id);

    List<Dispute> loadAll();

    List<Dispute> loadByCustomerId(UUID customerId);
}
