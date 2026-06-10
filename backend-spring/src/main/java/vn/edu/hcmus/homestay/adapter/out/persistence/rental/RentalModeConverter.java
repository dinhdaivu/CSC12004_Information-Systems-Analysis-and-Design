package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.rental.RentalMode;

@Converter
public class RentalModeConverter implements AttributeConverter<RentalMode, String> {

    @Override
    public String convertToDatabaseColumn(RentalMode attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case WHOLE_ROOM -> "whole_room";
            case SHARED_BED -> "shared_bed";
        };
    }

    @Override
    public RentalMode convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "whole_room" -> RentalMode.WHOLE_ROOM;
            case "shared_bed" -> RentalMode.SHARED_BED;
            default -> throw new IllegalArgumentException("Unknown rental_mode: " + dbData);
        };
    }
}
