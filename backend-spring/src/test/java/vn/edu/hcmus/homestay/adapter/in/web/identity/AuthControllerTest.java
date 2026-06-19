package vn.edu.hcmus.homestay.adapter.in.web.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.HttpHeaders;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.web.dto.identity.UserResponse;
import vn.edu.hcmus.homestay.application.port.in.identity.ChangePasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.ForgotPasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.ResetPasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.VerifyEmailUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.GetCurrentUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.LoginUseCase;
import vn.edu.hcmus.homestay.application.port.in.identity.RegisterUseCase;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.UnauthorizedException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegisterUseCase registerUseCase;

    @MockitoBean
    private LoginUseCase loginUseCase;

    @MockitoBean
    private GetCurrentUserUseCase getCurrentUserUseCase;

    @MockitoBean
    private ChangePasswordUseCase changePasswordUseCase;

    @MockitoBean
    private ForgotPasswordUseCase forgotPasswordUseCase;

    @MockitoBean
    private ResetPasswordUseCase resetPasswordUseCase;

    @MockitoBean
    private VerifyEmailUseCase verifyEmailUseCase;

    @Test
    void login_validCredentials_200WithToken() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = buildUser(userId, "user@example.com");
        LoginUseCase.LoginResult loginResult = new LoginUseCase.LoginResult("mock.jwt.token", user);
        when(loginUseCase.login(any(LoginUseCase.LoginCommand.class))).thenReturn(loginResult);

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"email":"user@example.com","password":"password123"}
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.data.user.email").value("user@example.com"));
    }

    @Test
    void login_invalidCredentials_401() throws Exception {
        when(loginUseCase.login(any(LoginUseCase.LoginCommand.class)))
                .thenThrow(new UnauthorizedException("Invalid email or password"));

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"email":"user@example.com","password":"wrong"}
                                        """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void register_newEmail_201() throws Exception {
        when(registerUseCase.register(any(RegisterUseCase.RegisterCommand.class)))
                .thenReturn("new@example.com");

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"email":"new@example.com","password":"pass123","confirmPassword":"pass123"}
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("new@example.com"));
    }

    @Test
    void register_duplicateEmail_409() throws Exception {
        when(registerUseCase.register(any(RegisterUseCase.RegisterCommand.class)))
                .thenThrow(new ConflictException("An account with this email already exists"));

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"email":"dup@example.com","password":"pass123","confirmPassword":"pass123"}
                                        """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("CONFLICT"));
    }

    @Test
    void getMe_noToken_401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void getMe_validToken_200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(userId, "user@example.com", AppRole.CUSTOMER);
        when(getCurrentUserUseCase.getCurrentUser(userId)).thenReturn(buildUser(userId, "user@example.com"));

        mockMvc.perform(
                        get("/api/auth/me")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("user@example.com"));
    }

    @Test
    void login_validCredentials_setsHttpOnlyCookie() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = buildUser(userId, "user@example.com");
        LoginUseCase.LoginResult loginResult = new LoginUseCase.LoginResult("mock.jwt.token", user);
        when(loginUseCase.login(any(LoginUseCase.LoginCommand.class))).thenReturn(loginResult);

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {"email":"user@example.com","password":"password123"}
                                        """))
                .andExpect(status().isOk())
                .andDo(result -> {
                    String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
                    assertThat(setCookie)
                            .contains("auth_token=mock.jwt.token")
                            .containsIgnoringCase("HttpOnly")
                            .contains("Path=/");
                });
    }

    @Test
    void logout_authenticated_clearsCookie() throws Exception {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(userId, "user@example.com", AppRole.CUSTOMER);

        mockMvc.perform(
                        post("/api/auth/logout")
                                .with(SecurityMockMvcRequestPostProcessors.authentication(
                                        new UsernamePasswordAuthenticationToken(
                                                principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andDo(result -> {
                    String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
                    assertThat(setCookie)
                            .contains("auth_token=")
                            .contains("Max-Age=0");
                });
    }

    private User buildUser(UUID id, String email) {
        return new User(id, email, "Test User", null, null, null, null, null,
                AppRole.CUSTOMER, UserStatus.ACTIVE, null, Instant.now(), Instant.now());
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
