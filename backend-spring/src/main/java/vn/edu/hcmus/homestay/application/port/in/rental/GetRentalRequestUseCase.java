package vn.edu.hcmus.homestay.application.port.in.rental;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

public interface GetRentalRequestUseCase {

    RentalRequest getRentalRequest(UUID id, UUID callerId, boolean callerIsStaff);

    List<RentalRequest> getMyRentalRequests(UUID customerId);

    List<RentalRequest> getAllRentalRequests();
}
