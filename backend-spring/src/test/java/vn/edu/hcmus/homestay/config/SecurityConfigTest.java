package vn.edu.hcmus.homestay.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.in.web.HealthController;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpoint_noToken_200() throws Exception {
        mockMvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void protectedRoute_noToken_401() throws Exception {
        // POST /api/rooms is a write operation — not covered by the GET permitAll rule
        mockMvc.perform(post("/api/rooms"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void publicGetRoute_noToken_200OrNotFound() throws Exception {
        // GET /api/rooms is permitted without a token (catalog read)
        int status =
                mockMvc.perform(get("/api/rooms"))
                        .andReturn()
                        .getResponse()
                        .getStatus();
        org.assertj.core.api.Assertions.assertThat(status).isNotEqualTo(401);
    }

    @Test
    void authenticatedRequest_doesNotGet401() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "u@e.com", AppRole.CUSTOMER);
        int status =
                mockMvc.perform(
                                get("/api/rooms")
                                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                                new UsernamePasswordAuthenticationToken(
                                                        principal,
                                                        null,
                                                        principal.getAuthorities()))))
                        .andReturn()
                        .getResponse()
                        .getStatus();
        org.assertj.core.api.Assertions.assertThat(status).isNotEqualTo(401);
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
