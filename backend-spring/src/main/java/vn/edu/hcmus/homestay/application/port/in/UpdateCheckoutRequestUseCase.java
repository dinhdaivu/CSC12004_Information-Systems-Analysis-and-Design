package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

public interface UpdateCheckoutRequestUseCase {

    CheckoutRequest confirmCheckout(UUID id);

    CheckoutRequest cancelCheckout(UUID id);

    /** Completes the checkout and publishes a CheckoutCompletedEvent. */
    CheckoutRequest completeCheckout(UUID id);
}
