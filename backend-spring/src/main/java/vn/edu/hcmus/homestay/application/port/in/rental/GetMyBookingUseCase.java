package vn.edu.hcmus.homestay.application.port.in.rental;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.application.model.query.MyBookingView;

public interface GetMyBookingUseCase {

    List<MyBookingView> getMyBookings(UUID customerId, String statusFilter);

    MyBookingView getMyBooking(UUID bookingId, UUID customerId);

    boolean checkAvailability(UUID bookingId, UUID customerId);

    MyBookingView submitProof(UUID bookingId, UUID customerId, String proofImageUrl);

    MyBookingView cancelBooking(UUID bookingId, UUID customerId);
}
