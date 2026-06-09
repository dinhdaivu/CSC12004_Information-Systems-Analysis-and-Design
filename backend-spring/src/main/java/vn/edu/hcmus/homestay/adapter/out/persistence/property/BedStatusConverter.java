package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;

@Converter(autoApply = true)
public class BedStatusConverter implements AttributeConverter<BedStatus, String> {

    @Override
    public String convertToDatabaseColumn(BedStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public BedStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return BedStatus.valueOf(dbData.toUpperCase());
    }
}
