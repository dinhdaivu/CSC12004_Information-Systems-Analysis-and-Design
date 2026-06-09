package vn.edu.hcmus.homestay.application.port.in.identity;

public interface ForgotPasswordUseCase {

    /** Sends a password-reset link to the given email if the account exists. */
    void forgotPassword(ForgotPasswordCommand command);

    record ForgotPasswordCommand(String email) {}
}
