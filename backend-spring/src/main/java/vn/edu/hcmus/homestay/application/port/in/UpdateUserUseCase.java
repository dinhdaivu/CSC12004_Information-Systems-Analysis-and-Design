package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

public interface UpdateUserUseCase {

    User updateUser(UUID id, UpdateUserCommand command);

    record UpdateUserCommand(AppRole role, UserStatus status) {}
}
