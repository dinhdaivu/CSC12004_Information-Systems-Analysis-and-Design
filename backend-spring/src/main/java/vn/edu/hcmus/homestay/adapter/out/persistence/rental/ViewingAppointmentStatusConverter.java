package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

@Converter(autoApply = true)
public class ViewingAppointmentStatusConverter implements AttributeConverter<ViewingAppointmentStatus, String> {

    @Override
    public String convertToDatabaseColumn(ViewingAppointmentStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public ViewingAppointmentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return ViewingAppointmentStatus.valueOf(dbData.toUpperCase());
    }
}
