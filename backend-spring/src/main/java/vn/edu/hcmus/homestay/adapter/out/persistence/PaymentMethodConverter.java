package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;

@Converter(autoApply = true)
public class PaymentMethodConverter implements AttributeConverter<PaymentMethod, String> {

    @Override
    public String convertToDatabaseColumn(PaymentMethod method) {
        return method == null ? null : method.name().toLowerCase();
    }

    @Override
    public PaymentMethod convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return PaymentMethod.valueOf(dbData.toUpperCase());
    }
}
