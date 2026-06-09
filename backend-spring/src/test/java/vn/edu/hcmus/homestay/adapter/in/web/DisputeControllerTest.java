package vn.edu.hcmus.homestay.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
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
import vn.edu.hcmus.homestay.application.port.in.ManageDisputeUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(DisputeController.class)
@Import(SecurityConfig.class)
class DisputeControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ManageDisputeUseCase manageDisputeUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void listDisputes_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/disputes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listDisputes_asCustomer_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(manageDisputeUseCase.listDisputes(eq(customerId), eq(false))).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/disputes")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createDispute_authenticated_201() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID disputeId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(manageDisputeUseCase.createDispute(any())).thenReturn(dispute(disputeId, customerId));

        mockMvc.perform(
                        post("/api/disputes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"John Doe\",\"reason\":\"Wrong amount\"}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void resolveDispute_asCustomer_403() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID disputeId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(
                        patch("/api/disputes/{id}/resolve", disputeId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"RESOLVED\"}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void resolveDispute_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID disputeId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "manager@example.com", AppRole.MANAGER);
        when(manageDisputeUseCase.resolveDispute(eq(disputeId), any()))
                .thenReturn(dispute(disputeId, UUID.randomUUID()));

        mockMvc.perform(
                        patch("/api/disputes/{id}/resolve", disputeId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"RESOLVED\",\"resolution_note\":\"Clarified\"}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Dispute dispute(UUID id, UUID customerId) {
        return new Dispute(
                id, null, null, customerId, "John Doe", null,
                "Wrong amount", null, DisputeStatus.PENDING, null, null, null,
                Instant.now(), Instant.now());
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
