package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.user.User;

@Component
class UserMapper {

    User toDomain(UserEntity e) {
        return new User(
                e.getId(),
                e.getEmail(),
                e.getFullName(),
                e.getPhoneNumber(),
                e.getIdentityNumber(),
                e.getGender(),
                e.getNationality(),
                e.getAvatarUrl(),
                e.getRole(),
                e.getStatus(),
                e.getPasswordHash(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    UserEntity toEntity(User u) {
        UserEntity e = new UserEntity();
        // Preserve id so JPA issues UPDATE (not INSERT) when saving an existing user.
        if (u.getId() != null) {
            e.setId(u.getId());
        }
        e.setEmail(u.getEmail());
        e.setFullName(u.getFullName());
        e.setPhoneNumber(u.getPhoneNumber());
        e.setIdentityNumber(u.getIdentityNumber());
        e.setGender(u.getGender());
        e.setNationality(u.getNationality());
        e.setAvatarUrl(u.getAvatarUrl());
        e.setRole(u.getRole());
        e.setStatus(u.getStatus());
        e.setPasswordHash(u.getPasswordHash());
        return e;
    }
}
