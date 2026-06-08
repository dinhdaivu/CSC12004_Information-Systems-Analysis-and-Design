package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentType;

@Converter(autoApply = true)
public class PaymentTypeConverter implements AttributeConverter<PaymentType, String> {

    @Override
    public String convertToDatabaseColumn(PaymentType type) {
        return type == null ? null : type.name().toLowerCase();
    }

    @Override
    public PaymentType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return PaymentType.valueOf(dbData.toUpperCase());
    }
}
