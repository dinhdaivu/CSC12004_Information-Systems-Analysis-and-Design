package vn.edu.hcmus.homestay.adapter.in.web.identity;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.identity.DeactivateUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.GetUserByIdUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.ListUsersUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.UpdateUserUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@WebMvcTest(UserManagementController.class)
@Import(SecurityConfig.class)
class UserManagementControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ListUsersUseCase listUsersUseCase;

    @MockitoBean
    private GetUserByIdUseCase getUserByIdUseCase;

    @MockitoBean
    private UpdateUserUseCase updateUserUseCase;

    @MockitoBean
    private DeactivateUserUseCase deactivateUserUseCase;

    // ── listUsers ─────────────────────────────────────────────────────────────

    @Test
    void listUsers_asManager_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(listUsersUseCase.listUsers(any()))
                .thenReturn(new PageImpl<>(List.of(sampleUser()), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/users")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void listUsers_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(get("/api/users")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void listUsers_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    // ── getUserById ───────────────────────────────────────────────────────────

    @Test
    void getUserById_asManager_200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(getUserByIdUseCase.getUserById(userId)).thenReturn(sampleUser(userId));

        mockMvc.perform(get("/api/users/{id}", userId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(userId.toString()));
    }

    // ── updateUser ────────────────────────────────────────────────────────────

    @Test
    void updateUser_asAdmin_200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "admin@example.com", AppRole.ADMIN);
        User updated = sampleUser(userId, AppRole.SALE, UserStatus.ACTIVE);
        when(updateUserUseCase.updateUser(eq(userId), any())).thenReturn(updated);

        mockMvc.perform(patch("/api/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"sale\"}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateUser_asManager_403() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);

        mockMvc.perform(patch("/api/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"sale\"}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    // ── deactivateUser ────────────────────────────────────────────────────────

    @Test
    void deactivateUser_asAdmin_200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "admin@example.com", AppRole.ADMIN);
        User deactivated = sampleUser(userId, AppRole.CUSTOMER, UserStatus.INACTIVE);
        when(deactivateUserUseCase.deactivateUser(userId)).thenReturn(deactivated);

        mockMvc.perform(delete("/api/users/{id}", userId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deactivateUser_asManager_403() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);

        mockMvc.perform(delete("/api/users/{id}", userId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User sampleUser() {
        return sampleUser(UUID.randomUUID(), AppRole.CUSTOMER, UserStatus.ACTIVE);
    }

    private User sampleUser(UUID id) {
        return sampleUser(id, AppRole.CUSTOMER, UserStatus.ACTIVE);
    }

    private User sampleUser(UUID id, AppRole role, UserStatus status) {
        return new User(
                id, "user@example.com", "Full Name", null, null, null, null, null,
                role, status, "hashed", Instant.now(), Instant.now());
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
