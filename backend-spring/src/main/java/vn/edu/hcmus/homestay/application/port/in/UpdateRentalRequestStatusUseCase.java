package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

public interface UpdateRentalRequestStatusUseCase {

    RentalRequest updateStatus(UUID id, RentalRequestStatus newStatus);
}
