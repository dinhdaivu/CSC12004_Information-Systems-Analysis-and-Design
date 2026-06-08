package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

public interface GetRentalRequestUseCase {

    RentalRequest getRentalRequest(UUID id, UserPrincipal caller);

    List<RentalRequest> getMyRentalRequests(UUID customerId);

    List<RentalRequest> getAllRentalRequests();
}
