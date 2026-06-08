package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;

public interface SaveRentalRequestPort {

    RentalRequest save(RentalRequest request);
}
