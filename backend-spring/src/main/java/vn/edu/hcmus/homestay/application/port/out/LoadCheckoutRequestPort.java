package vn.edu.hcmus.homestay.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

public interface LoadCheckoutRequestPort {

    Optional<CheckoutRequest> loadById(UUID id);

    List<CheckoutRequest> loadAll();

    List<CheckoutRequest> loadByCustomerId(UUID customerId);
}
