package vn.edu.hcmus.homestay.adapter.in.web;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check endpoint. Mirrors the Express backend's {@code GET /api/health}
 * response shape exactly: {@code {"status":"OK","timestamp":<ISO-8601>}}.
 *
 * <p>Intentionally NOT Spring Boot Actuator's {@code /actuator/health} — that has a
 * different payload shape and would break parity with the current API.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "OK");
        body.put("timestamp", Instant.now().toString());
        return body;
    }
}
