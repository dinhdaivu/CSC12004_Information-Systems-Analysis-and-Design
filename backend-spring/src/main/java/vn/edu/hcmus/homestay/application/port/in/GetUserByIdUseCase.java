package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.user.User;

public interface GetUserByIdUseCase {

    User getUserById(UUID id);
}
