package vn.edu.hcmus.homestay.application.port.out.rental;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

public interface LoadViewingAppointmentPort {

    Optional<ViewingAppointment> loadById(UUID id);

    List<ViewingAppointment> loadAll();
}
