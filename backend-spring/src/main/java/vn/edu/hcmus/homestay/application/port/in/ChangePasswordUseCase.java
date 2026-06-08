package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;

public interface ChangePasswordUseCase {

    void changePassword(UUID userId, ChangePasswordCommand command);

    record ChangePasswordCommand(String currentPassword, String newPassword) {}
}
