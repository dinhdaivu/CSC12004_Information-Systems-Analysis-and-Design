package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

@Converter(autoApply = true)
public class DisputeStatusConverter implements AttributeConverter<DisputeStatus, String> {

    @Override
    public String convertToDatabaseColumn(DisputeStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public DisputeStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return DisputeStatus.valueOf(dbData.toUpperCase());
    }
}
