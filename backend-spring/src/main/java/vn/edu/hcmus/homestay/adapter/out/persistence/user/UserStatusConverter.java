package vn.edu.hcmus.homestay.adapter.out.persistence.user;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@Converter(autoApply = true)
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

    @Override
    public String convertToDatabaseColumn(UserStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public UserStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return UserStatus.valueOf(dbData.toUpperCase());
    }
}
