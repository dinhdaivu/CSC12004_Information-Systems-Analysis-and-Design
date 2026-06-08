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
import vn.edu.hcmus.homestay.application.port.in.CreateRentalRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetRentalRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateRentalRequestStatusUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(RentalRequestController.class)
@Import(SecurityConfig.class)
class RentalRequestControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateRentalRequestUseCase createRentalRequestUseCase;

    @MockitoBean
    private GetRentalRequestUseCase getRentalRequestUseCase;

    @MockitoBean
    private UpdateRentalRequestStatusUseCase updateRentalRequestStatusUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getMyRequests_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getRentalRequestUseCase.getMyRentalRequests(customerId)).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/rental-requests/my-requests")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getAllRequests_asCustomer_403() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(
                        get("/api/rental-requests")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllRequests_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(getRentalRequestUseCase.getAllRentalRequests()).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/rental-requests")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createRentalRequest_unauthenticated_401() throws Exception {
        mockMvc.perform(
                        post("/api/rental-requests")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"people_count\":1}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateStatus_unauthenticated_401() throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(
                        patch("/api/rental-requests/{id}/status", id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"REVIEWING\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getRentalRequest_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getRentalRequestUseCase.getRentalRequest(eq(requestId), any())).thenReturn(
                rentalRequest(requestId, customerId));

        mockMvc.perform(
                        get("/api/rental-requests/{id}", requestId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(requestId.toString()));
    }

    @Test
    void getRentalRequest_notFound_404() throws Exception {
        UUID requestId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(getRentalRequestUseCase.getRentalRequest(eq(requestId), any()))
                .thenThrow(new NotFoundException("Rental request not found"));

        mockMvc.perform(
                        get("/api/rental-requests/{id}", requestId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void createRentalRequest_authenticated_201() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(createRentalRequestUseCase.createRentalRequest(any())).thenReturn(
                rentalRequest(requestId, customerId));

        mockMvc.perform(
                        post("/api/rental-requests")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"people_count\":2}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateStatus_asStaff_200() throws Exception {
        UUID requestId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(updateRentalRequestStatusUseCase.updateStatus(eq(requestId), any())).thenReturn(
                rentalRequest(requestId, UUID.randomUUID()));

        mockMvc.perform(
                        patch("/api/rental-requests/{id}/status", requestId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"REVIEWING\"}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RentalRequest rentalRequest(UUID id, UUID customerId) {
        return new RentalRequest(
                id, customerId, null, null, null, null, null, null,
                1, null, RentalRequestStatus.REQUESTED, Instant.now(), Instant.now());
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
