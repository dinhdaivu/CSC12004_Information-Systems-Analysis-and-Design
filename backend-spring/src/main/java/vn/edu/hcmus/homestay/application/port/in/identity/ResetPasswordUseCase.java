package vn.edu.hcmus.homestay.application.port.in.identity;

public interface ResetPasswordUseCase {

    /** Resets the password using the token sent by email. */
    void resetPassword(ResetPasswordCommand command);

    record ResetPasswordCommand(
            String email, String code, String password, String confirmPassword) {}
}
