package vn.edu.hcmus.homestay.application.port.out.identity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Outbound port for sending transactional emails (Resend — Phase 9). */
public interface EmailPort {

    // Existing Phase 1 stubs
    void sendPasswordResetEmail(String to, String resetToken);

    void sendEmailVerificationEmail(String to, String verificationCode);

    // Phase 9 — deposit flow
    void sendDepositInstruction(
            String toEmail,
            String customerName,
            UUID bookingId,
            BigDecimal depositAmount,
            Instant dueAt);

    void sendDepositRejected(
            String toEmail,
            String customerName,
            String roomLabel,
            String branchName,
            String resultNote);

    void sendDepositFailed(String toEmail, String customerName, String reason);

    void sendDepositConfirmed(
            String toEmail, String customerName, String roomLabel, BigDecimal depositAmount);

    void sendDepositSubmitted(
            String toEmail,
            String customerName,
            String roomLabel,
            BigDecimal depositAmount,
            UUID depositId);

    void sendDepositTermsAndPayment(
            String toEmail,
            String customerName,
            String bookingId,
            BigDecimal depositAmount,
            String dueAt);

    // Phase 9 — viewing flow
    void sendViewingApproved(
            String toEmail,
            String customerName,
            Instant scheduledAt,
            String roomLabel,
            String branchName);

    void sendViewingDeclined(String toEmail, String customerName, String roomLabel, String reason);
}
