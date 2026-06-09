package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

@Converter(autoApply = true)
public class RentalRequestStatusConverter implements AttributeConverter<RentalRequestStatus, String> {

    @Override
    public String convertToDatabaseColumn(RentalRequestStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public RentalRequestStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return RentalRequestStatus.valueOf(dbData.toUpperCase());
    }
}
