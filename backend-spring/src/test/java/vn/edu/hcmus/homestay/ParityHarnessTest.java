package vn.edu.hcmus.homestay;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/**
 * Compares both the Express and Spring Boot backends by replaying every
 * endpoint from {@code tests/load/latency.js} and asserting the same HTTP
 * status code is returned from each.
 *
 * <p><b>Requires both backends to be running externally.</b>
 *
 * <pre>
 * ./gradlew test --tests "vn.edu.hcmus.homestay.ParityHarnessTest" \
 *   -PexpressUrl=http://localhost:3000 \
 *   -PspringUrl=http://localhost:8080  \
 *   -PtestEmail=you@example.com        \
 *   -PtestPassword=secret
 * </pre>
 *
 * <p>If one side is unreachable the individual test is skipped (not failed) so
 * the other side's pass/fail is still reported.
 *
 * <p>Without {@code -PtestEmail}/{@code -PtestPassword}, authenticated endpoints
 * are tested unauthenticated — both backends must agree on the same non-2xx status.
 */
@EnabledIfSystemProperty(named = "EXPRESS_URL", matches = ".+")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParityHarnessTest {

    private static final String EXPRESS_BASE =
            System.getProperty("EXPRESS_URL", "");
    private static final String SPRING_BASE  =
            System.getProperty("SPRING_URL",  "http://localhost:8080");

    /** Never throws on 4xx/5xx — we capture and compare the codes ourselves. */
    private final RestTemplate rest = buildRestTemplate();

    /** JWT from Express login; accepted by Spring Boot (same JWT_SECRET). */
    private String sharedToken;

    @BeforeAll
    void loginAgainstExpress() {
        String email    = System.getProperty("TEST_EMAIL");
        String password = System.getProperty("TEST_PASSWORD");
        if (email == null || password == null) return;

        try {
            ResponseEntity<Map> res = rest.exchange(
                    EXPRESS_BASE + "/api/auth/login",
                    HttpMethod.POST,
                    new HttpEntity<>(
                            "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password),
                            jsonHeaders()),
                    Map.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) res.getBody().get("data");
                if (data != null) sharedToken = (String) data.get("token");
            }
        } catch (ResourceAccessException ignored) {
            // Express not reachable — individual tests will skip via assumeReachable()
        }
    }

    // ── public ────────────────────────────────────────────────────────────────

    @Test
    void health_parity() {
        ResponseEntity<String> spring  = get(SPRING_BASE  + "/api/health", false);
        ResponseEntity<String> express = get(EXPRESS_BASE + "/api/health", false);

        assertSameStatus("/api/health", spring, express);
        assertThat(spring.getBody()).contains("\"status\":\"OK\"", "\"timestamp\"");
        assertThat(express.getBody()).contains("\"status\":\"OK\"", "\"timestamp\"");
    }

    @Test void branches_parity()        { assertStatusParity("/api/branches",               false); }
    @Test void rooms_parity()           { assertStatusParity("/api/rooms",                  false); }
    @Test void zones_parity()           { assertStatusParity("/api/zones",                  false); }
    @Test void beds_parity()            { assertStatusParity("/api/bed",                    false); }
    @Test void defaultHandover_parity() { assertStatusParity("/api/default-handover-items", false); }

    // ── booking flow ──────────────────────────────────────────────────────────

    @Test void viewingAppointments_parity() { assertStatusParity("/api/viewing-appointments", true); }
    @Test void rentalRequests_parity()      { assertStatusParity("/api/rental-requests",      true); }
    @Test void myBookings_parity()          { assertStatusParity("/api/my-bookings",          true); }
    @Test void lodgingEligibility_parity()  { assertStatusParity("/api/lodging-eligibility",  true); }

    // ── financial ─────────────────────────────────────────────────────────────

    @Test void deposits_parity()  { assertStatusParity("/api/deposits",  true); }
    @Test void payments_parity()  { assertStatusParity("/api/payments",  true); }
    @Test void contracts_parity() { assertStatusParity("/api/contracts", true); }

    // ── post check-in ─────────────────────────────────────────────────────────

    @Test void handovers_parity()        { assertStatusParity("/api/handovers",         true); }
    @Test void disputes_parity()         { assertStatusParity("/api/disputes",          true); }
    @Test void checkoutRequests_parity() { assertStatusParity("/api/checkout-requests", true); }

    // ── admin ─────────────────────────────────────────────────────────────────

    @Test void users_parity()          { assertStatusParity("/api/users",           true); }
    @Test void adminDashboard_parity() { assertStatusParity("/api/admin-dashboard", true); }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void assertStatusParity(String path, boolean withAuth) {
        assertSameStatus(path, get(SPRING_BASE + path, withAuth), get(EXPRESS_BASE + path, withAuth));
    }

    private void assertSameStatus(String path, ResponseEntity<?> spring, ResponseEntity<?> express) {
        assertThat(spring.getStatusCode())
                .as("Status parity for GET %s", path)
                .isEqualTo(express.getStatusCode());
    }

    private ResponseEntity<String> get(String url, boolean withAuth) {
        try {
            return rest.exchange(url, HttpMethod.GET, new HttpEntity<>(authHeaders(withAuth)), String.class);
        } catch (ResourceAccessException ex) {
            assumeTrue(false, "Backend not reachable: " + url + " — " + ex.getMessage());
            throw ex; // unreachable, satisfies compiler
        }
    }

    private HttpHeaders authHeaders(boolean withAuth) {
        HttpHeaders h = jsonHeaders();
        if (withAuth && sharedToken != null) h.set("Authorization", "Bearer " + sharedToken);
        return h;
    }

    private static HttpHeaders jsonHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.set("Content-Type", "application/json");
        return h;
    }

    private static RestTemplate buildRestTemplate() {
        RestTemplate t = new RestTemplate(new SimpleClientHttpRequestFactory());
        t.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public boolean hasError(org.springframework.http.client.ClientHttpResponse r) {
                return false; // let callers inspect the status themselves
            }
        });
        return t;
    }
}
