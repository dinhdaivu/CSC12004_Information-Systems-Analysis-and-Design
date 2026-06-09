package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@Converter(autoApply = true)
public class RoomStatusConverter implements AttributeConverter<RoomStatus, String> {

    @Override
    public String convertToDatabaseColumn(RoomStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public RoomStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return RoomStatus.valueOf(dbData.toUpperCase());
    }
}
