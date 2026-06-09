package vn.edu.hcmus.homestay.application.port.in.rental;

import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

public interface UpdateViewingAppointmentUseCase {

    ViewingAppointment cancelAppointment(UUID id);

    ViewingAppointment recordOutcome(UUID id, RecordOutcomeCommand command);

    ViewingAppointment updateAppointment(UUID id, UpdateAppointmentCommand command);

    record RecordOutcomeCommand(String resultNote, ViewingAppointmentStatus status) {}

    record UpdateAppointmentCommand(UUID saleId, UUID roomId, UUID bedId, Instant scheduledAt) {}
}
