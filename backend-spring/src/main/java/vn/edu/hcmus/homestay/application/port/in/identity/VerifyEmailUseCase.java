package vn.edu.hcmus.homestay.application.port.in.identity;

import vn.edu.hcmus.homestay.domain.model.user.User;

public interface VerifyEmailUseCase {

    /** Marks the account as verified and returns a JWT + user for immediate login. */
    VerifyEmailResult verifyEmail(VerifyEmailCommand command);

    record VerifyEmailCommand(String email, String code) {}

    record VerifyEmailResult(String token, User user) {}
}
