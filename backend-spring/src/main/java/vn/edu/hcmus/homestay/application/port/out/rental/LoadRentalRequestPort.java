package vn.edu.hcmus.homestay.application.port.out.rental;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

public interface LoadRentalRequestPort {

    Optional<RentalRequest> loadById(UUID id);

    List<RentalRequest> loadByCustomerId(UUID customerId);

    List<RentalRequest> loadAll();

    long countNonCancelled();

    List<RentalRequest> findRecent(int limit);
}
