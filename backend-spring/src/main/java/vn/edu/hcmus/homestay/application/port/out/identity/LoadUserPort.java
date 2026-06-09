package vn.edu.hcmus.homestay.application.port.out.identity;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

public interface LoadUserPort {

    Optional<User> loadByEmail(String email);

    Optional<User> loadById(UUID id);

    boolean existsByEmail(String email);

    Page<User> loadWithFilters(String search, AppRole role, UserStatus status, int page, int limit);

    long countAll();
}
