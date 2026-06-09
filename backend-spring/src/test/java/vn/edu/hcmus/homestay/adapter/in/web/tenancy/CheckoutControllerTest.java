package vn.edu.hcmus.homestay.adapter.in.web.tenancy;

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
import vn.edu.hcmus.homestay.application.port.in.tenancy.CreateCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.tenancy.GetCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.GetSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.CreateSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.UpdateDeductionUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.ConfirmSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.CompleteSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.SignSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.tenancy.GetInspectionUseCase;
import vn.edu.hcmus.homestay.application.port.in.tenancy.CreateInspectionUseCase;
import vn.edu.hcmus.homestay.application.port.in.tenancy.UpdateCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutStatus;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;
import vn.edu.hcmus.homestay.domain.model.settlement.SettlementStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(CheckoutController.class)
@Import(SecurityConfig.class)
class CheckoutControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateCheckoutRequestUseCase createCheckoutRequestUseCase;

    @MockitoBean
    private GetCheckoutRequestUseCase getCheckoutRequestUseCase;

    @MockitoBean
    private UpdateCheckoutRequestUseCase updateCheckoutRequestUseCase;

    @MockitoBean
    private GetSettlementUseCase getSettlementUseCase;

    @MockitoBean
    private CreateSettlementUseCase createSettlementUseCase;

    @MockitoBean
    private UpdateDeductionUseCase updateDeductionUseCase;

    @MockitoBean
    private ConfirmSettlementUseCase confirmSettlementUseCase;

    @MockitoBean
    private CompleteSettlementUseCase completeSettlementUseCase;

    @MockitoBean
    private SignSettlementUseCase signSettlementUseCase;

    @MockitoBean
    private GetInspectionUseCase getInspectionUseCase;

    @MockitoBean
    private CreateInspectionUseCase createInspectionUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void listMyCheckouts_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/checkout-requests/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listMyCheckouts_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getCheckoutRequestUseCase.listMyCheckoutRequests(customerId)).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/checkout-requests/my")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void listAllCheckouts_asCustomer_403() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(
                        get("/api/checkout-requests")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void listAllCheckouts_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(getCheckoutRequestUseCase.listCheckoutRequests()).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/checkout-requests")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createCheckout_authenticated_201() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(createCheckoutRequestUseCase.createCheckoutRequest(any()))
                .thenReturn(checkoutRequest(requestId, contractId, customerId));

        mockMvc.perform(
                        post("/api/checkout-requests")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"contract_id\":\"" + contractId + "\","
                                        + "\"requested_checkout_date\":\"2026-09-01\"}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void confirmCheckout_asCustomer_403() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(
                        patch("/api/checkout-requests/{id}/confirm", requestId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void confirmCheckout_asManager_200() throws Exception {
        UUID managerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(managerId, "manager@example.com", AppRole.MANAGER);
        when(updateCheckoutRequestUseCase.confirmCheckout(eq(requestId)))
                .thenReturn(checkoutRequest(requestId, UUID.randomUUID(), UUID.randomUUID()));

        mockMvc.perform(
                        patch("/api/checkout-requests/{id}/confirm", requestId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getSettlement_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getSettlementUseCase.getSettlement(eq(requestId))).thenReturn(settlement(requestId));

        mockMvc.perform(
                        get("/api/checkout-requests/{id}/settlement", requestId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createSettlement_asAccountant_201() throws Exception {
        UUID accountantId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(accountantId, "accountant@example.com", AppRole.ACCOUNTANT);
        when(createSettlementUseCase.createSettlement(eq(requestId), any())).thenReturn(settlement(requestId));

        mockMvc.perform(
                        post("/api/checkout-requests/{id}/settlement", requestId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"deposit_total\":5000000,\"deduction\":0}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CheckoutRequest checkoutRequest(UUID id, UUID contractId, UUID customerId) {
        return new CheckoutRequest(
                id, contractId, customerId, LocalDate.now().plusDays(7), null,
                CheckoutStatus.REQUESTED, Instant.now(), Instant.now());
    }

    private Settlement settlement(UUID checkoutRequestId) {
        return new Settlement(
                UUID.randomUUID(), checkoutRequestId, UUID.randomUUID(), null,
                new BigDecimal("5000000"), new BigDecimal("0.7"), BigDecimal.ZERO,
                new BigDecimal("3500000"), null, SettlementStatus.DRAFT, null, null, null,
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
