package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

public interface GetCheckoutRequestUseCase {

    CheckoutRequest getCheckoutRequest(UUID id);

    List<CheckoutRequest> listCheckoutRequests();

    List<CheckoutRequest> listMyCheckoutRequests(UUID customerId);
}
