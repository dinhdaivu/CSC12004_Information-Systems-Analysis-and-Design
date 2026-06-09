package vn.edu.hcmus.homestay.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
import vn.edu.hcmus.homestay.application.port.in.CreateHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateHandoverUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverAggregate;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(HandoverController.class)
@Import(SecurityConfig.class)
class HandoverControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateHandoverUseCase createHandoverUseCase;

    @MockitoBean
    private GetHandoverUseCase getHandoverUseCase;

    @MockitoBean
    private UpdateHandoverUseCase updateHandoverUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void listHandovers_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/handovers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listHandovers_authenticated_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(getHandoverUseCase.listHandovers(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/handovers")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createHandover_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(post("/api/handovers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "contract_id": "%s",
                                  "customer_id": "%s"
                                }
                                """.formatted(UUID.randomUUID(), UUID.randomUUID()))
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void createHandover_asStaff_201() throws Exception {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(createHandoverUseCase.createHandover(any()))
                .thenReturn(handoverAggregate(handoverId, contractId, customerId));

        mockMvc.perform(post("/api/handovers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "contract_id": "%s",
                                  "customer_id": "%s"
                                }
                                """.formatted(contractId, customerId))
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void completeHandover_asCustomer_403() throws Exception {
        UUID handoverId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(patch("/api/handovers/{id}/complete", handoverId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void completeHandover_asManager_200() throws Exception {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(updateHandoverUseCase.completeHandover(eq(handoverId), any()))
                .thenReturn(handoverAggregate(handoverId, contractId, customerId));

        mockMvc.perform(patch("/api/handovers/{id}/complete", handoverId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void signHandover_authenticated_200() throws Exception {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);
        when(updateHandoverUseCase.signHandover(eq(handoverId), any()))
                .thenReturn(handoverAggregate(handoverId, contractId, customerId));

        mockMvc.perform(patch("/api/handovers/{id}/sign", handoverId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customer_signature_url\":\"https://cust.sig\"}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private HandoverAggregate handoverAggregate(UUID handoverId, UUID contractId, UUID customerId) {
        Handover handover = new Handover(
                handoverId, contractId, null, customerId,
                Instant.now(), HandoverStatus.PENDING, null, null, null, null,
                Instant.now(), Instant.now());
        return new HandoverAggregate(
                handover, null, null, null,
                UUID.randomUUID(), null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                List.of());
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
