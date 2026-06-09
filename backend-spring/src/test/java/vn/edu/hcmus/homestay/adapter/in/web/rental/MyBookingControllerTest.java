package vn.edu.hcmus.homestay.adapter.in.web.rental;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import vn.edu.hcmus.homestay.application.port.in.rental.GetMyBookingUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.application.model.query.MyBookingView;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(MyBookingController.class)
@Import(SecurityConfig.class)
class MyBookingControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetMyBookingUseCase getMyBookingUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getMyBookings_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/my-booking"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMyBookings_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getMyBookingUseCase.getMyBookings(eq(customerId), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/my-booking")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getMyBookingView_notFound_404() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getMyBookingUseCase.getMyBooking(eq(bookingId), eq(customerId)))
                .thenThrow(new NotFoundException("Booking not found"));

        mockMvc.perform(get("/api/my-booking/{id}", bookingId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void checkAvailability_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getMyBookingUseCase.checkAvailability(eq(bookingId), eq(customerId))).thenReturn(true);

        mockMvc.perform(get("/api/my-booking/{id}/check-availability", bookingId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isAvailable").value(true));
    }

    @Test
    void cancelBooking_authenticated_200() throws Exception {
        UUID customerId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);
        when(getMyBookingUseCase.cancelBooking(eq(bookingId), eq(customerId)))
                .thenReturn(myBooking(bookingId, customerId));

        mockMvc.perform(post("/api/my-booking/{id}/cancel", bookingId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void submitProof_unauthenticated_401() throws Exception {
        mockMvc.perform(post("/api/my-booking/{id}/submit-proof", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"proof_image_url\":\"https://example.com/proof.jpg\"}"))
                .andExpect(status().isUnauthorized());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private MyBookingView myBooking(UUID id, UUID customerId) {
        return new MyBookingView(
                id, customerId, null, null, null, null, null, null,
                1, null, "cancelled", null, null, null, null, null,
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
