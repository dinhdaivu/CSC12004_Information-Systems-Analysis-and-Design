package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;

@Converter(autoApply = true)
public class HandoverStatusConverter implements AttributeConverter<HandoverStatus, String> {

    @Override
    public String convertToDatabaseColumn(HandoverStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public HandoverStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return HandoverStatus.valueOf(dbData.toUpperCase());
    }
}
