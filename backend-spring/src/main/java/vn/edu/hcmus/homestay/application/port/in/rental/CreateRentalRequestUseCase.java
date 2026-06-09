package vn.edu.hcmus.homestay.application.port.in.rental;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

public interface CreateRentalRequestUseCase {

    RentalRequest createRentalRequest(CreateRentalRequestCommand command);

    record CreateRentalRequestCommand(
            UUID customerId,
            UUID branchId,
            UUID roomId,
            UUID bedId,
            String preferredRoomType,
            BigDecimal budgetMin,
            BigDecimal budgetMax,
            int peopleCount,
            String note) {}
}
