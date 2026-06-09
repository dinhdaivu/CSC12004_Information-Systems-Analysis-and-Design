package vn.edu.hcmus.homestay.adapter.out.storage;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
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
import vn.edu.hcmus.homestay.application.port.out.storage.StoragePort;

@Component
public class CloudinaryAdapter implements StoragePort {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryAdapter.class);

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Override
    public String upload(String base64Data, String folder, String publicIdPrefix) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            log.warn("Cloudinary not configured — skipping upload");
            return null;
        }
        try {
            String url = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";
            long timestamp = System.currentTimeMillis() / 1000;

            String dataUri =
                    base64Data.startsWith("data:")
                            ? base64Data
                            : "data:image/jpeg;base64," + base64Data;

            Map<String, String> body = new HashMap<>();
            body.put("file", dataUri);
            body.put("folder", folder);
            body.put("api_key", apiKey);
            body.put("timestamp", String.valueOf(timestamp));

            String toSign;
            if (publicIdPrefix != null && !publicIdPrefix.isBlank()) {
                String publicId = publicIdPrefix + "-" + timestamp;
                body.put("public_id", publicId);
                toSign = "folder=" + folder + "&public_id=" + publicId + "&timestamp=" + timestamp
                        + apiSecret;
            } else {
                toSign = "folder=" + folder + "&timestamp=" + timestamp + apiSecret;
            }
            body.put("signature", sha1Hex(toSign));

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("secure_url");
            }
        } catch (Exception ex) {
            log.error("Cloudinary upload failed ({})", ex.getClass().getSimpleName());
        }
        return null;
    }

    private static String sha1Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
