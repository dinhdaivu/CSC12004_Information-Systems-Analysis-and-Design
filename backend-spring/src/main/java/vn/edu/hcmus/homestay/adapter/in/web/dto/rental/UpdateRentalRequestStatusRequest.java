package vn.edu.hcmus.homestay.adapter.in.web.dto.rental;

import jakarta.validation.constraints.NotNull;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

public class UpdateRentalRequestStatusRequest {

    @NotNull
    private RentalRequestStatus status;

    public RentalRequestStatus getStatus() {
        return status;
    }

    public void setStatus(RentalRequestStatus status) {
        this.status = status;
    }
}
