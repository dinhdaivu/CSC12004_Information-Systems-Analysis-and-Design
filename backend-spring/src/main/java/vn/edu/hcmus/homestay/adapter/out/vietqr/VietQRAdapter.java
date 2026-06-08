package vn.edu.hcmus.homestay.adapter.out.vietqr;

import java.math.BigDecimal;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import vn.edu.hcmus.homestay.application.port.out.GenerateVietQRPort;

@Component
public class VietQRAdapter implements GenerateVietQRPort {

    private static final Logger log = LoggerFactory.getLogger(VietQRAdapter.class);
    private static final String API_URL = "https://api.vietqr.io/v2/generate";

    @Value("${vietqr.client-id:}")
    private String clientId;

    @Value("${vietqr.client-secret:}")
    private String clientSecret;

    @Value("${vietqr.bank-bin:970422}")
    private String bankBin;

    @Value("${vietqr.account-no:}")
    private String accountNo;

    @Value("${vietqr.account-name:}")
    private String accountName;

    @Value("${vietqr.template:compact}")
    private String template;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generateQRUrl(BigDecimal amount, String description) {
        if (clientId.isBlank() || clientSecret.isBlank() || accountNo.isBlank()) {
            log.warn("VietQR not configured — skipping QR generation");
            return null;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", clientSecret);

            Map<String, Object> body = Map.of(
                    "accountNo", accountNo,
                    "accountName", accountName,
                    "acqId", bankBin,
                    "amount", amount.intValue(),
                    "addInfo", description,
                    "format", "text",
                    "template", template);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                    API_URL, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null) {
                    return (String) data.get("qrDataURL");
                }
            }
        } catch (Exception ex) {
            log.error("VietQR API call failed ({})", ex.getClass().getSimpleName());
        }
        return null;
    }
}
