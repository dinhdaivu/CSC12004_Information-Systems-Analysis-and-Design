package vn.edu.hcmus.homestay;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;

/**
 * Replays requests against both the Express backend and Spring Boot and diffs
 * status + JSON. Only runs when EXPRESS_URL is set (e.g. http://localhost:3000).
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@EnabledIfEnvironmentVariable(named = "EXPRESS_URL", matches = ".+")
class ParityHarnessTest extends AbstractContainerBaseTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate rest;

    private static final String EXPRESS_BASE = System.getenv("EXPRESS_URL");

    @Test
    void healthParityWithExpress() {
        ResponseEntity<String> spring =
                rest.getForEntity("http://localhost:" + port + "/api/health", String.class);
        ResponseEntity<String> express =
                rest.getForEntity(EXPRESS_BASE + "/api/health", String.class);

        assertThat(spring.getStatusCode()).isEqualTo(express.getStatusCode());
        assertThat(spring.getBody()).contains("\"status\":\"OK\"");
        assertThat(express.getBody()).contains("\"status\":\"OK\"");
        assertThat(spring.getBody()).contains("\"timestamp\"");
        assertThat(express.getBody()).contains("\"timestamp\"");
    }
}
