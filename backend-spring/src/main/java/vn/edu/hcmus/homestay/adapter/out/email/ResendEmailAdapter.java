package vn.edu.hcmus.homestay.adapter.out.email;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;

@Component
public class ResendEmailAdapter implements EmailPort {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailAdapter.class);
    private static final String FROM = "Homestay Dorm <noreply@homestaydorm.asia>";
    private static final String RESEND_URL = "https://api.resend.com/emails";
    private static final DateTimeFormatter VN_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    @Value("${resend.api-key:}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();

    /** Send helper — graceful no-op when key is blank. */
    private void send(String to, String subject, String html) {
        if (apiKey.isBlank()) {
            log.debug("Resend not configured — skipping email to {}", to);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            Map<String, Object> body = Map.of(
                    "from", FROM,
                    "to", new String[] {to},
                    "subject", subject,
                    "html", html);
            rest.exchange(RESEND_URL, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
        } catch (Exception ex) {
            log.error("Resend email failed to {} ({})", to, ex.getClass().getSimpleName());
        }
    }

    /** Simple HTML card template. */
    private String card(String title, String content) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px'>"
                + "<h2 style='color:#264893'>" + title + "</h2>"
                + content
                + "<p style='color:#888;font-size:12px;margin-top:32px'>Homestay Dorm &mdash; automated notification</p>"
                + "</div>";
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        send(to, "Reset your Homestay Dorm password",
                card("Password Reset",
                        "<p>Your reset token: <strong>" + resetToken + "</strong></p>"));
    }

    @Override
    public void sendEmailVerificationEmail(String to, String verificationCode) {
        send(to, "Verify your Homestay Dorm email",
                card("Email Verification",
                        "<p>Your code: <strong>" + verificationCode + "</strong></p>"));
    }

    @Override
    public void sendDepositInstruction(
            String toEmail,
            String customerName,
            UUID bookingId,
            BigDecimal depositAmount,
            Instant dueAt) {
        String due = VN_FORMATTER.format(dueAt);
        send(toEmail, "Deposit instructions for your booking",
                card("Deposit Required",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Your booking has been approved. Please deposit <strong>"
                                + depositAmount + " VND</strong> by <strong>" + due + "</strong>.</p>"
                                + "<p>Booking ID: " + bookingId + "</p>"));
    }

    @Override
    public void sendDepositRejected(
            String toEmail,
            String customerName,
            String roomLabel,
            String branchName,
            String resultNote) {
        send(toEmail, "Your booking request was not approved",
                card("Booking Not Approved",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Unfortunately your request for <strong>" + roomLabel
                                + "</strong> at " + branchName + " could not be processed.</p>"
                                + "<p>Reason: " + resultNote + "</p>"));
    }

    @Override
    public void sendDepositFailed(String toEmail, String customerName, String reason) {
        send(toEmail, "Your deposit payment window has expired",
                card("Deposit Expired",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Your deposit payment window has expired. " + reason + "</p>"));
    }

    @Override
    public void sendDepositConfirmed(
            String toEmail, String customerName, String roomLabel, BigDecimal depositAmount) {
        send(toEmail, "Deposit confirmed — welcome to Homestay Dorm!",
                card("Deposit Confirmed",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Your deposit of <strong>" + depositAmount + " VND</strong> for "
                                + roomLabel + " has been confirmed.</p>"));
    }

    @Override
    public void sendDepositSubmitted(
            String toEmail,
            String customerName,
            String roomLabel,
            BigDecimal depositAmount,
            UUID depositId) {
        send(toEmail, "Proof of payment received",
                card("Payment Proof Received",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>We received your proof of payment for <strong>" + roomLabel
                                + "</strong>.</p>"
                                + "<p>Amount: " + depositAmount + " VND | Reference: " + depositId
                                + "</p>"));
    }

    @Override
    public void sendDepositTermsAndPayment(
            String toEmail,
            String customerName,
            String bookingId,
            BigDecimal depositAmount,
            String dueAt) {
        send(toEmail, "Deposit terms and payment details",
                card("Deposit Details",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Deposit: <strong>" + depositAmount + " VND</strong></p>"
                                + "<p>Due: " + dueAt + " | Booking: " + bookingId + "</p>"));
    }

    @Override
    public void sendViewingApproved(
            String toEmail,
            String customerName,
            Instant scheduledAt,
            String roomLabel,
            String branchName) {
        String time = VN_FORMATTER.format(scheduledAt);
        send(toEmail, "Room viewing scheduled",
                card("Viewing Scheduled",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Your viewing for <strong>" + roomLabel + "</strong> at "
                                + branchName + " is scheduled for <strong>" + time + "</strong>.</p>"));
    }

    @Override
    public void sendViewingDeclined(
            String toEmail, String customerName, String roomLabel, String reason) {
        send(toEmail, "Room viewing cancelled",
                card("Viewing Cancelled",
                        "<p>Hi " + customerName + ",</p>"
                                + "<p>Your viewing for <strong>" + roomLabel
                                + "</strong> has been cancelled.</p>"
                                + "<p>Reason: " + reason + "</p>"));
    }
}
