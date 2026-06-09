package vn.edu.hcmus.homestay.application.port.in.rental;

import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

public interface CreateViewingAppointmentUseCase {

    ViewingAppointment createViewingAppointment(CreateViewingAppointmentCommand command);

    record CreateViewingAppointmentCommand(
            UUID rentalRequestId,
            UUID customerId,
            UUID saleId,
            UUID roomId,
            UUID bedId,
            Instant scheduledAt) {}
}
