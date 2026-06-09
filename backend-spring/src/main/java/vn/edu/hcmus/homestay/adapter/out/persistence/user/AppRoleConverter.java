package vn.edu.hcmus.homestay.adapter.out.persistence.user;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@Converter(autoApply = true)
public class AppRoleConverter implements AttributeConverter<AppRole, String> {

    @Override
    public String convertToDatabaseColumn(AppRole role) {
        return role == null ? null : role.name().toLowerCase();
    }

    @Override
    public AppRole convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return AppRole.valueOf(dbData.toUpperCase());
    }
}
