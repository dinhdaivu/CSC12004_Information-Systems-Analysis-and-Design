package vn.edu.hcmus.homestay.application.port.out;

import java.util.Optional;

/** Outbound port for persisting password-reset tokens (Phase 9). */
public interface PasswordResetTokenPort {

    /** Creates and stores a reset token for the given email; returns the token value. */
    String createResetToken(String email);

    /**
     * Validates the token for the given email. Returns the email address if valid, empty if the
     * token has expired or doesn't match.
     */
    Optional<String> validateResetToken(String email, String code);

    /** Invalidates a token after successful use. */
    void invalidateResetToken(String email, String code);
}
