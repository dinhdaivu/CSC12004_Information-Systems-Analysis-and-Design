package vn.edu.hcmus.homestay.application.port.in;

import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

public interface CreateCheckoutRequestUseCase {

    CheckoutRequest createCheckoutRequest(CreateCheckoutRequestCommand cmd);

    record CreateCheckoutRequestCommand(
            UUID contractId,
            UUID customerId,
            LocalDate requestedCheckoutDate,
            String reason) {}
}
