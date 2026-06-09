package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspectionStatus;

@Converter(autoApply = true)
public class CheckoutInspectionStatusConverter implements AttributeConverter<CheckoutInspectionStatus, String> {

    @Override
    public String convertToDatabaseColumn(CheckoutInspectionStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public CheckoutInspectionStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return CheckoutInspectionStatus.valueOf(dbData.toUpperCase());
    }
}
