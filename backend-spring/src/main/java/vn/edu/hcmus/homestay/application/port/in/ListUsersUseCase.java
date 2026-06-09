package vn.edu.hcmus.homestay.application.port.in;

import org.springframework.data.domain.Page;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

public interface ListUsersUseCase {

    Page<User> listUsers(ListUsersQuery query);

    record ListUsersQuery(String search, AppRole role, UserStatus status, int page, int limit) {}
}
