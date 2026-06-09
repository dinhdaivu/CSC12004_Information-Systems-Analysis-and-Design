package vn.edu.hcmus.homestay.application.port.in.identity;

import java.util.UUID;

public interface ChangePasswordUseCase {

    void changePassword(UUID userId, ChangePasswordCommand command);

    record ChangePasswordCommand(String currentPassword, String newPassword) {}
}
