package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.settlement.SettlementStatus;

@Converter(autoApply = true)
public class SettlementStatusConverter implements AttributeConverter<SettlementStatus, String> {

    @Override
    public String convertToDatabaseColumn(SettlementStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public SettlementStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return SettlementStatus.valueOf(dbData.toUpperCase());
    }
}
