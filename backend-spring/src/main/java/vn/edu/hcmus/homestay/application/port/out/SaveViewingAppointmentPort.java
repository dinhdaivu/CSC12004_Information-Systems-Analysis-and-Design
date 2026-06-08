package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

public interface SaveViewingAppointmentPort {

    ViewingAppointment save(ViewingAppointment appointment);
}
