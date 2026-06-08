package vn.edu.hcmus.homestay.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;

public interface LoadDepositPort {

    Optional<DepositRequest> loadById(UUID id);

    List<DepositRequest> loadAll();

    /** Returns all PENDING deposits whose dueAt is before the given instant (for the scheduler). */
    List<DepositRequest> loadPendingExpired(Instant now);
}
