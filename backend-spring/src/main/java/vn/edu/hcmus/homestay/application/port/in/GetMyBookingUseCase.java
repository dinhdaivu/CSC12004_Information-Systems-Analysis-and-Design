package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.mybooking.MyBooking;

public interface GetMyBookingUseCase {

    List<MyBooking> getMyBookings(UUID customerId, String statusFilter);

    MyBooking getMyBooking(UUID bookingId, UUID customerId);

    boolean checkAvailability(UUID bookingId, UUID customerId);

    MyBooking submitProof(UUID bookingId, UUID customerId, String proofImageUrl);

    MyBooking cancelBooking(UUID bookingId, UUID customerId);
}
