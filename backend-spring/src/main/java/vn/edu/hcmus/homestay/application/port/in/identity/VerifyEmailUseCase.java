package vn.edu.hcmus.homestay.application.port.in.identity;

public interface VerifyEmailUseCase {

    /** Marks the account as verified using the code sent by email. */
    void verifyEmail(VerifyEmailCommand command);

    record VerifyEmailCommand(String email, String code) {}
}
