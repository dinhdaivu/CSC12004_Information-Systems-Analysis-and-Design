package vn.edu.hcmus.homestay.application.port.out.identity;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

public interface LoadUserPort {

    Optional<User> loadByEmail(String email);

    Optional<User> loadById(UUID id);

    List<User> loadByIds(Collection<UUID> ids);

    boolean existsByEmail(String email);

    Page<User> loadWithFilters(String search, AppRole role, UserStatus status, int page, int limit);

    long countAll();
}
