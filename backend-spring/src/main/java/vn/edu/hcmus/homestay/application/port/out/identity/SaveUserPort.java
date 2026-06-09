package vn.edu.hcmus.homestay.application.port.out.identity;

import vn.edu.hcmus.homestay.domain.model.user.User;

public interface SaveUserPort {

    User save(User user);
}
