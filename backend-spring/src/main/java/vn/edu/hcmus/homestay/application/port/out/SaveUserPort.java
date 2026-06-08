package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.user.User;

public interface SaveUserPort {

    User save(User user);
}
