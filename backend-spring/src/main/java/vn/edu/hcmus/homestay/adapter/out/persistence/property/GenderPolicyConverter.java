package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.room.GenderPolicy;

@Converter(autoApply = true)
public class GenderPolicyConverter implements AttributeConverter<GenderPolicy, String> {

    @Override
    public String convertToDatabaseColumn(GenderPolicy policy) {
        return policy == null ? null : policy.name().toLowerCase();
    }

    @Override
    public GenderPolicy convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return GenderPolicy.valueOf(dbData.toUpperCase());
    }
}
