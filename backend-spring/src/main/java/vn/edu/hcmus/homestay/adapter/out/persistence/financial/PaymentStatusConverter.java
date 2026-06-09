package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus;

@Converter(autoApply = true)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(PaymentStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return PaymentStatus.valueOf(dbData.toUpperCase());
    }
}
