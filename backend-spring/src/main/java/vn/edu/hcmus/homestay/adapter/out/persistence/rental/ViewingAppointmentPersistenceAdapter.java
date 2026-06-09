package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadViewingAppointmentPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveViewingAppointmentPort;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

@Component
class ViewingAppointmentPersistenceAdapter implements LoadViewingAppointmentPort, SaveViewingAppointmentPort {

    private final ViewingAppointmentJpaRepository jpaRepository;
    private final ViewingAppointmentMapper mapper;

    ViewingAppointmentPersistenceAdapter(
            ViewingAppointmentJpaRepository jpaRepository, ViewingAppointmentMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<ViewingAppointment> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ViewingAppointment> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public ViewingAppointment save(ViewingAppointment appointment) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(appointment)));
    }
}
