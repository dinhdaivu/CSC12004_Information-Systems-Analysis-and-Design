package vn.edu.hcmus.homestay.adapter.in.web.property;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.property.GetZoneUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

@WebMvcTest(ZoneController.class)
@Import(SecurityConfig.class)
class ZoneControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetZoneUseCase getZoneUseCase;

    @Test
    void getZone_found_200() throws Exception {
        UUID zoneId = UUID.randomUUID();
        when(getZoneUseCase.getZone(eq(zoneId))).thenReturn(zone(zoneId));

        mockMvc.perform(get("/api/zones/{id}", zoneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private Zone zone(UUID id) {
        return new Zone(id, UUID.randomUUID(), "Zone A", Instant.now(), Instant.now());
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
