package vn.edu.hcmus.homestay.domain.model.user;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class User {

    private final UUID id;
    private final String email;
    private final String fullName;
    private final String phoneNumber;
    private final String identityNumber;
    private final String gender;
    private final String nationality;
    private final String avatarUrl;
    private final AppRole role;
    private final UserStatus status;
    private final String passwordHash;
    private final Instant createdAt;
    private final Instant updatedAt;

    public User(
            UUID id,
            String email,
            String fullName,
            String phoneNumber,
            String identityNumber,
            String gender,
            String nationality,
            String avatarUrl,
            AppRole role,
            UserStatus status,
            String passwordHash,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.identityNumber = identityNumber;
        this.gender = gender;
        this.nationality = nationality;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.status = status;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getIdentityNumber() {
        return identityNumber;
    }

    public String getGender() {
        return gender;
    }

    public String getNationality() {
        return nationality;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public AppRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /** Returns a copy of this user with a new password hash (used during password change). */
    public User withPasswordHash(String newPasswordHash) {
        return new User(
                id, email, fullName, phoneNumber, identityNumber, gender,
                nationality, avatarUrl, role, status, newPasswordHash,
                createdAt, updatedAt);
    }
}
