package vn.edu.hcmus.homestay.adapter.in.web.property;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.property.CreateBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.DeleteBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.GetBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.UpdateBedUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(BedController.class)
@Import(SecurityConfig.class)
class BedControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateBedUseCase createBedUseCase;

    @MockitoBean
    private GetBedUseCase getBedUseCase;

    @MockitoBean
    private UpdateBedUseCase updateBedUseCase;

    @MockitoBean
    private DeleteBedUseCase deleteBedUseCase;

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void createBed_validPayload_201() throws Exception {
        UUID roomId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(createBedUseCase.createBed(eq(roomId), any())).thenReturn(bed(roomId));

        mockMvc.perform(post("/api/rooms/{roomId}/beds", roomId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bed_number\":\"B01\",\"price_per_month\":3000000}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getBed_found_200() throws Exception {
        UUID bedId = UUID.randomUUID();
        when(getBedUseCase.getBed(eq(bedId))).thenReturn(bed(UUID.randomUUID()));

        // GET /api/beds/** is permitAll() in SecurityConfig
        mockMvc.perform(get("/api/beds/{id}", bedId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateBed_validPayload_200() throws Exception {
        UUID bedId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(updateBedUseCase.updateBed(eq(bedId), any())).thenReturn(bed(UUID.randomUUID()));

        mockMvc.perform(patch("/api/beds/{id}", bedId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price_per_month\":3500000}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deleteBed_noContent_200() throws Exception {
        UUID bedId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);

        mockMvc.perform(delete("/api/beds/{id}", bedId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Bed bed(UUID roomId) {
        return new Bed(UUID.randomUUID(), roomId, "B01",
                new BigDecimal("3000000"), BedStatus.AVAILABLE,
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
