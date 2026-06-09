package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;

@Converter(autoApply = true)
public class DepositStatusConverter implements AttributeConverter<DepositStatus, String> {

    @Override
    public String convertToDatabaseColumn(DepositStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public DepositStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return DepositStatus.valueOf(dbData.toUpperCase());
    }
}
