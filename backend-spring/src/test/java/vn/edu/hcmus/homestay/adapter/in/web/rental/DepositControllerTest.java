package vn.edu.hcmus.homestay.adapter.in.web.rental;

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
import vn.edu.hcmus.homestay.application.port.in.rental.CancelDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.ConfirmDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetDepositUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(DepositController.class)
@Import(SecurityConfig.class)
class DepositControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateDepositUseCase createDepositUseCase;

    @MockitoBean
    private GetDepositUseCase getDepositUseCase;

    @MockitoBean
    private ConfirmDepositUseCase confirmDepositUseCase;

    @MockitoBean
    private CancelDepositUseCase cancelDepositUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getAllDeposits_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/deposits"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllDeposits_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(get("/api/deposits")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllDeposits_asStaff_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(getDepositUseCase.getAllDeposits()).thenReturn(List.of());

        mockMvc.perform(get("/api/deposits")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getDeposit_asStaff_200() throws Exception {
        UUID depositId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(getDepositUseCase.getDeposit(depositId)).thenReturn(deposit(depositId));

        mockMvc.perform(get("/api/deposits/{id}", depositId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(depositId.toString()));
    }

    @Test
    void getDeposit_notFound_404() throws Exception {
        UUID depositId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(getDepositUseCase.getDeposit(depositId))
                .thenThrow(new NotFoundException("Deposit request not found"));

        mockMvc.perform(get("/api/deposits/{id}", depositId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void createDeposit_asStaff_201() throws Exception {
        UUID depositId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(createDepositUseCase.createDeposit(any())).thenReturn(deposit(depositId));

        mockMvc.perform(post("/api/deposits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "room_id": "%s",
                                  "amount": 5000000,
                                  "payment_method": "CASH"
                                }
                                """.formatted(UUID.randomUUID()))
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createDeposit_unauthenticated_401() throws Exception {
        mockMvc.perform(post("/api/deposits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"room_id\":\"" + UUID.randomUUID() + "\",\"amount\":5000000,\"payment_method\":\"CASH\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void confirmDeposit_asStaff_200() throws Exception {
        UUID depositId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "accountant@example.com", AppRole.ACCOUNTANT);
        when(confirmDepositUseCase.confirmDeposit(eq(depositId), any()))
                .thenReturn(deposit(depositId));

        mockMvc.perform(patch("/api/deposits/{id}/confirm", depositId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"payment_method\":\"CASH\"}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void cancelDeposit_asStaff_200() throws Exception {
        UUID depositId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(cancelDepositUseCase.cancelDeposit(depositId)).thenReturn(deposit(depositId));

        mockMvc.perform(patch("/api/deposits/{id}/cancel", depositId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private DepositRequest deposit(UUID id) {
        return new DepositRequest(
                id,
                null,
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                BigDecimal.valueOf(5000000),
                Instant.now().plusSeconds(86400),
                null,
                null,
                null,
                null,
                DepositStatus.PENDING,
                Instant.now(),
                Instant.now());
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
