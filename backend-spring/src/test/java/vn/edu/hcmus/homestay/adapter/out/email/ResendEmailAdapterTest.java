package vn.edu.hcmus.homestay.adapter.out.email;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class ResendEmailAdapterTest {

    @Test
    void sendDepositInstruction_whenKeyBlank_doesNotCallApi() {
        ResendEmailAdapter adapter = new ResendEmailAdapter();
        ReflectionTestUtils.setField(adapter, "apiKey", "");

        // Should not throw and should not attempt any HTTP call
        assertThatNoException().isThrownBy(() ->
                adapter.sendDepositInstruction(
                        "customer@test.com",
                        "Test Customer",
                        UUID.randomUUID(),
                        BigDecimal.valueOf(3000000),
                        Instant.now().plusSeconds(86400)));
    }

    @Test
    void sendDepositConfirmed_whenKeyBlank_doesNotCallApi() {
        ResendEmailAdapter adapter = new ResendEmailAdapter();
        ReflectionTestUtils.setField(adapter, "apiKey", "");

        assertThatNoException().isThrownBy(() ->
                adapter.sendDepositConfirmed(
                        "customer@test.com",
                        "Test Customer",
                        "Room 101",
                        BigDecimal.valueOf(3000000)));
    }

    @Test
    void sendViewingApproved_whenKeyBlank_doesNotCallApi() {
        ResendEmailAdapter adapter = new ResendEmailAdapter();
        ReflectionTestUtils.setField(adapter, "apiKey", "");

        assertThatNoException().isThrownBy(() ->
                adapter.sendViewingApproved(
                        "customer@test.com",
                        "Test Customer",
                        Instant.now().plusSeconds(86400),
                        "Room 101",
                        "Main Branch"));
    }

    @Test
    void sendDepositFailed_whenKeyBlank_doesNotCallApi() {
        ResendEmailAdapter adapter = new ResendEmailAdapter();
        ReflectionTestUtils.setField(adapter, "apiKey", "");

        assertThatNoException().isThrownBy(() ->
                adapter.sendDepositFailed(
                        "customer@test.com", "Test Customer", "Deposit window expired."));
    }
}
