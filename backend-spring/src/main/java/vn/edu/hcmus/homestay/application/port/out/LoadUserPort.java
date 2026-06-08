package vn.edu.hcmus.homestay.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.user.User;

public interface LoadUserPort {

    Optional<User> loadByEmail(String email);

    Optional<User> loadById(UUID id);

    boolean existsByEmail(String email);
}
