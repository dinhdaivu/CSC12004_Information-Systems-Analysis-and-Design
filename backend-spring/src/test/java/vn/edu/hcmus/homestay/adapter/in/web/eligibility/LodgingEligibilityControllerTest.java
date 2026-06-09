package vn.edu.hcmus.homestay.adapter.in.web.eligibility;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.eligibility.CheckEligibilityUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(LodgingEligibilityController.class)
@Import(SecurityConfig.class)
class LodgingEligibilityControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CheckEligibilityUseCase checkEligibilityUseCase;

    @Test
    void getEligibility_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/lodging-eligibility/{id}", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getEligibility_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(get("/api/lodging-eligibility/{id}", UUID.randomUUID())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getEligibility_asManager_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(checkEligibilityUseCase.getEligibility(eq(customerId))).thenReturn(eligibility(customerId));

        mockMvc.perform(get("/api/lodging-eligibility/{id}", customerId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void checkEligibility_asManager_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(checkEligibilityUseCase.checkEligibility(any())).thenReturn(eligibility(customerId));

        mockMvc.perform(post("/api/lodging-eligibility/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customer_id\":\"" + customerId + "\",\"identity_verified\":true,"
                                + "\"documents_complete\":true,\"background_check_passed\":true}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private LodgingEligibility eligibility(UUID customerId) {
        return new LodgingEligibility(
                UUID.randomUUID(), customerId, UUID.randomUUID(),
                true, true, true, null, "ELIGIBLE", null, null,
                Instant.now(), Instant.now(), Instant.now());
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Primary
        @Bean
        public JwtTokenProvider jwtTokenProvider() {
            return new JwtTokenProvider(SECRET);
        }
    }
}
