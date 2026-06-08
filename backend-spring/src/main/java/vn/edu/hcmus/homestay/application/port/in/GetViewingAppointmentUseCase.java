package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

public interface GetViewingAppointmentUseCase {

    ViewingAppointment getViewingAppointment(UUID id);

    List<ViewingAppointment> getAllViewingAppointments();
}
