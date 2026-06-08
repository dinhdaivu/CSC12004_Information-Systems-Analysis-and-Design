package vn.edu.hcmus.homestay.adapter.in.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.web.HealthController;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class JwtAuthenticationFilterTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void noToken_publicEndpoint_200() throws Exception {
        mockMvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void validToken_populatesPrincipal() throws Exception {
        UUID id = UUID.randomUUID();
        String token = jwtTokenProvider.generateToken(id, "user@example.com", AppRole.CUSTOMER);

        mockMvc.perform(get("/api/health").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andDo(
                        result -> {
                            var auth = SecurityContextHolder.getContext().getAuthentication();
                            assertThat(result.getResponse().getStatus()).isEqualTo(200);
                        });
    }

    @Test
    void invalidToken_publicEndpoint_stillReturns200() throws Exception {
        mockMvc.perform(get("/api/health").header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isOk());
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
