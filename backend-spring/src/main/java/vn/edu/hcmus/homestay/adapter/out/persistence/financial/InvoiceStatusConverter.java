package vn.edu.hcmus.homestay.adapter.out.persistence.financial;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.financial.InvoiceStatus;

@Converter
public class InvoiceStatusConverter implements AttributeConverter<InvoiceStatus, String> {

    @Override
    public String convertToDatabaseColumn(InvoiceStatus attribute) {
        if (attribute == null) return null;
        return attribute.name().toLowerCase();
    }

    @Override
    public InvoiceStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return InvoiceStatus.valueOf(dbData.toUpperCase());
    }
}
