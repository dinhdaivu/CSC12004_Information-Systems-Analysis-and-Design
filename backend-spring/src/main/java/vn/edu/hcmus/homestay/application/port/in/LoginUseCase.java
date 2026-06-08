package vn.edu.hcmus.homestay.application.port.in;

import vn.edu.hcmus.homestay.domain.model.user.User;

public interface LoginUseCase {

    LoginResult login(LoginCommand command);

    record LoginCommand(String email, String password) {}

    record LoginResult(String token, User user) {}
}
