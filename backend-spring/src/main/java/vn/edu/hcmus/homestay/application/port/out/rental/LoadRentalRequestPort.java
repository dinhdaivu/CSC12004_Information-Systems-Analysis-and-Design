package vn.edu.hcmus.homestay.application.port.out.rental;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

public interface LoadRentalRequestPort {

    Optional<RentalRequest> loadById(UUID id);

    List<RentalRequest> loadByIds(Collection<UUID> ids);

    List<RentalRequest> loadByCustomerId(UUID customerId);

    List<RentalRequest> loadAll();

    long countNonCancelled();

    List<RentalRequest> findRecent(int limit);

    List<RentalRequest> loadByStatus(RentalRequestStatus status);
}
