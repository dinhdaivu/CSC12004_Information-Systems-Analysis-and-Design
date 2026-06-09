package vn.edu.hcmus.homestay.application.port.out.identity;

/** Outbound port for sending transactional emails (Resend — Phase 9). */
public interface EmailPort {

    void sendPasswordResetEmail(String to, String resetToken);

    void sendEmailVerificationEmail(String to, String verificationCode);
}
