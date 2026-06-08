package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

@Component
class ViewingAppointmentMapper {

    ViewingAppointment toDomain(ViewingAppointmentEntity e) {
        return new ViewingAppointment(
                e.getId(),
                e.getRentalRequestId(),
                e.getCustomerId(),
                e.getSaleId(),
                e.getRoomId(),
                e.getBedId(),
                e.getScheduledAt(),
                e.getResultNote(),
                e.getStatus(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    ViewingAppointmentEntity toEntity(ViewingAppointment a) {
        ViewingAppointmentEntity e = new ViewingAppointmentEntity();
        if (a.getId() != null) {
            e.setId(a.getId());
        }
        e.setRentalRequestId(a.getRentalRequestId());
        e.setCustomerId(a.getCustomerId());
        e.setSaleId(a.getSaleId());
        e.setRoomId(a.getRoomId());
        e.setBedId(a.getBedId());
        e.setScheduledAt(a.getScheduledAt());
        e.setResultNote(a.getResultNote());
        e.setStatus(a.getStatus());
        return e;
    }
}
