package vn.edu.hcmus.homestay.adapter.in.web.rental;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import vn.edu.hcmus.homestay.application.port.in.rental.CreateContractUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetContractUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.SignContractUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(ContractController.class)
@Import(SecurityConfig.class)
class ContractControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateContractUseCase createContractUseCase;

    @MockitoBean
    private GetContractUseCase getContractUseCase;

    @MockitoBean
    private SignContractUseCase signContractUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getMyContracts_authenticated_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);
        when(getContractUseCase.getMyContracts(principal.getId())).thenReturn(List.of());

        mockMvc.perform(get("/api/contracts/my")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getAllContracts_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(get("/api/contracts")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllContracts_asStaff_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(getContractUseCase.getAllContracts(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/contracts")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createContract_unauthenticated_401() throws Exception {
        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customer_id": "%s",
                                  "room_id": "%s",
                                  "start_date": "2024-01-01",
                                  "end_date": "2024-07-01",
                                  "monthly_price": 3000000
                                }
                                """.formatted(UUID.randomUUID(), UUID.randomUUID())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createContract_asStaff_201() throws Exception {
        UUID contractId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(createContractUseCase.createContract(any())).thenReturn(contract(contractId));

        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customer_id": "%s",
                                  "room_id": "%s",
                                  "start_date": "2024-01-01",
                                  "end_date": "2024-07-01",
                                  "monthly_price": 3000000
                                }
                                """.formatted(UUID.randomUUID(), UUID.randomUUID()))
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getContract_notFound_404() throws Exception {
        UUID contractId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);
        when(getContractUseCase.getContract(contractId))
                .thenThrow(new NotFoundException("Contract not found"));

        mockMvc.perform(get("/api/contracts/{id}", contractId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Contract contract(UUID id) {
        return new Contract(
                id, UUID.randomUUID(), null, UUID.randomUUID(), null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                BigDecimal.valueOf(3000000), ContractStatus.ACTIVE, null, null,
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
