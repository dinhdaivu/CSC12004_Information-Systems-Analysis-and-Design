package vn.edu.hcmus.homestay.application.port.out;

import java.math.BigDecimal;

public interface GenerateVietQRPort {

    /** Returns the QR data URL (base64 PNG), or null if the API is unavailable. */
    String generateQRUrl(BigDecimal amount, String description);
}
