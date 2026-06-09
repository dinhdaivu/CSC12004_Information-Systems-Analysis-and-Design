package vn.edu.hcmus.homestay.application.port.out.tenancy;

import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;

public interface SaveCheckoutRequestPort {

    CheckoutRequest save(CheckoutRequest r);
}
