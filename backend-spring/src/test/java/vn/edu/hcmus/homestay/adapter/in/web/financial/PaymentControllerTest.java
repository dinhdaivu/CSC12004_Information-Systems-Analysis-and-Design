package vn.edu.hcmus.homestay.adapter.in.web.financial;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.financial.GetPaymentUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentType;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(PaymentController.class)
@Import(SecurityConfig.class)
class PaymentControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetPaymentUseCase getPaymentUseCase;

    @Test
    void getAllPayments_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/payments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllPayments_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);
        mockMvc.perform(get("/api/payments")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllPayments_asAccountant_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "acc@example.com", AppRole.ACCOUNTANT);
        when(getPaymentUseCase.getAllPayments()).thenReturn(List.of(payment()));

        mockMvc.perform(get("/api/payments")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private Payment payment() {
        return new Payment(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("3000000"), PaymentType.DEPOSIT, PaymentStatus.COMPLETED,
                PaymentMethod.TRANSFER, null, null, null, Instant.now(), Instant.now());
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
