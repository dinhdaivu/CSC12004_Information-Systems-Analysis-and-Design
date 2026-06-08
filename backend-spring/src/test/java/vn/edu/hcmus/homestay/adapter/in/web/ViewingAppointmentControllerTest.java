package vn.edu.hcmus.homestay.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import vn.edu.hcmus.homestay.application.port.in.CreateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

@WebMvcTest(ViewingAppointmentController.class)
@Import(SecurityConfig.class)
class ViewingAppointmentControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateViewingAppointmentUseCase createViewingAppointmentUseCase;

    @MockitoBean
    private GetViewingAppointmentUseCase getViewingAppointmentUseCase;

    @MockitoBean
    private UpdateViewingAppointmentUseCase updateViewingAppointmentUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getAllAppointments_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/viewing-appointments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllAppointments_asCustomer_403() throws Exception {
        UUID customerId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(
                        get("/api/viewing-appointments")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllAppointments_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(getViewingAppointmentUseCase.getAllViewingAppointments()).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/viewing-appointments")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createAppointment_unauthenticated_401() throws Exception {
        mockMvc.perform(
                        post("/api/viewing-appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "rental_request_id":"00000000-0000-0000-0000-000000000001",
                                          "customer_id":"00000000-0000-0000-0000-000000000002",
                                          "scheduled_at":"2026-07-01T10:00:00Z"
                                        }
                                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getViewingAppointment_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID appointmentId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(getViewingAppointmentUseCase.getViewingAppointment(appointmentId)).thenReturn(
                appointment(appointmentId));

        mockMvc.perform(
                        get("/api/viewing-appointments/{id}", appointmentId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(appointmentId.toString()));
    }

    @Test
    void getViewingAppointment_notFound_404() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID appointmentId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        when(getViewingAppointmentUseCase.getViewingAppointment(appointmentId))
                .thenThrow(new NotFoundException("Viewing appointment not found"));

        mockMvc.perform(
                        get("/api/viewing-appointments/{id}", appointmentId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void cancelAppointment_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID appointmentId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        ViewingAppointment cancelled = new ViewingAppointment(
                appointmentId, UUID.randomUUID(), UUID.randomUUID(), null, null, null,
                Instant.now(), null, ViewingAppointmentStatus.CANCELLED, Instant.now(), Instant.now());
        when(updateViewingAppointmentUseCase.cancelAppointment(appointmentId)).thenReturn(cancelled);

        mockMvc.perform(
                        patch("/api/viewing-appointments/{id}/cancel", appointmentId)
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void recordOutcome_asStaff_200() throws Exception {
        UUID staffId = UUID.randomUUID();
        UUID appointmentId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);
        ViewingAppointment completed = new ViewingAppointment(
                appointmentId, UUID.randomUUID(), UUID.randomUUID(), null, null, null,
                Instant.now(), "Looks good", ViewingAppointmentStatus.COMPLETED, Instant.now(), Instant.now());
        when(updateViewingAppointmentUseCase.recordOutcome(eq(appointmentId), any())).thenReturn(completed);

        mockMvc.perform(
                        patch("/api/viewing-appointments/{id}/outcome", appointmentId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"result_note\":\"Looks good\",\"status\":\"COMPLETED\"}")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ViewingAppointment appointment(UUID id) {
        return new ViewingAppointment(
                id, UUID.randomUUID(), UUID.randomUUID(), null, null, null,
                Instant.now(), null, ViewingAppointmentStatus.SCHEDULED, Instant.now(), Instant.now());
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
