package vn.edu.hcmus.homestay.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.edu.hcmus.homestay.application.port.in.ChangePasswordUseCase.ChangePasswordCommand;
import vn.edu.hcmus.homestay.application.port.in.ForgotPasswordUseCase.ForgotPasswordCommand;
import vn.edu.hcmus.homestay.application.port.in.LoginUseCase.LoginCommand;
import vn.edu.hcmus.homestay.application.port.in.LoginUseCase.LoginResult;
import vn.edu.hcmus.homestay.application.port.in.RegisterUseCase.RegisterCommand;
import vn.edu.hcmus.homestay.application.port.in.ResetPasswordUseCase.ResetPasswordCommand;
import vn.edu.hcmus.homestay.application.port.in.VerifyEmailUseCase.VerifyEmailCommand;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveUserPort;
import vn.edu.hcmus.homestay.application.port.out.TokenPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.common.exception.UnauthorizedException;
import vn.edu.hcmus.homestay.common.exception.ValidationException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private SaveUserPort saveUserPort;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenPort tokenPort;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(loadUserPort, saveUserPort, passwordEncoder, tokenPort);
    }

    // ── register ────────────────────────────────────────────────────────────

    @Test
    void register_newEmail_returnsNormalisedEmail() {
        when(loadUserPort.existsByEmail("alice@example.com")).thenReturn(false);
        when(saveUserPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String result = authService.register(
                new RegisterCommand("  Alice@Example.COM  ", "secret123", "secret123"));

        assertThat(result).isEqualTo("alice@example.com");
        verify(saveUserPort).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        when(loadUserPort.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                        new RegisterCommand("alice@example.com", "secret123", "secret123")))
                .isInstanceOf(ConflictException.class);

        verify(saveUserPort, never()).save(any());
    }

    @Test
    void register_passwordMismatch_throwsValidation() {
        assertThatThrownBy(() -> authService.register(
                        new RegisterCommand("alice@example.com", "secret123", "different")))
                .isInstanceOf(ValidationException.class);

        verify(loadUserPort, never()).existsByEmail(anyString());
        verify(saveUserPort, never()).save(any());
    }

    @Test
    void register_defaultsRoleToCustomer() {
        when(loadUserPort.existsByEmail(anyString())).thenReturn(false);
        when(saveUserPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.register(new RegisterCommand("bob@test.com", "pass123", "pass123"));

        verify(saveUserPort).save(argThat(u -> u.getRole() == AppRole.CUSTOMER));
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returnsTokenAndUser() {
        UUID id = UUID.randomUUID();
        User user = activeUser(id, "alice@example.com", "hashed");
        when(loadUserPort.loadByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);
        when(tokenPort.generateToken(id, "alice@example.com", AppRole.CUSTOMER))
                .thenReturn("jwt.token");

        LoginResult result =
                authService.login(new LoginCommand("alice@example.com", "secret123"));

        assertThat(result.token()).isEqualTo("jwt.token");
        assertThat(result.user()).isEqualTo(user);
    }

    @Test
    void login_unknownEmail_throwsUnauthorized() {
        when(loadUserPort.loadByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(
                        () -> authService.login(new LoginCommand("nobody@example.com", "pass")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        User user = activeUser(UUID.randomUUID(), "alice@example.com", "hashed");
        when(loadUserPort.loadByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginCommand("alice@example.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_inactiveAccount_throwsForbidden() {
        UUID id = UUID.randomUUID();
        User inactive = new User(
                id, "alice@example.com", "Alice", null, null, null, null, null,
                AppRole.CUSTOMER, UserStatus.INACTIVE, "hashed", null, null);
        when(loadUserPort.loadByEmail("alice@example.com")).thenReturn(Optional.of(inactive));
        when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(new LoginCommand("alice@example.com", "pass")))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── getCurrentUser ────────────────────────────────────────────────────────

    @Test
    void getCurrentUser_found_returnsUser() {
        UUID id = UUID.randomUUID();
        User user = activeUser(id, "alice@example.com", "hashed");
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(user));

        assertThat(authService.getCurrentUser(id)).isEqualTo(user);
    }

    @Test
    void getCurrentUser_notFound_throwsNotFound() {
        UUID id = UUID.randomUUID();
        when(loadUserPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── changePassword ────────────────────────────────────────────────────────

    @Test
    void changePassword_validCurrentPassword_savesNewHash() {
        UUID id = UUID.randomUUID();
        User user = activeUser(id, "alice@example.com", "oldHash");
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "oldHash")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newHash");
        when(saveUserPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.changePassword(id, new ChangePasswordCommand("oldPass", "newPass"));

        verify(saveUserPort).save(argThat(u -> "newHash".equals(u.getPasswordHash())));
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsUnauthorized() {
        UUID id = UUID.randomUUID();
        User user = activeUser(id, "alice@example.com", "oldHash");
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "oldHash")).thenReturn(false);

        assertThatThrownBy(
                        () -> authService.changePassword(
                                id, new ChangePasswordCommand("wrong", "newPass")))
                .isInstanceOf(UnauthorizedException.class);

        verify(saveUserPort, never()).save(any());
    }

    @Test
    void changePassword_userNotFound_throwsNotFound() {
        UUID id = UUID.randomUUID();
        when(loadUserPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(
                        () -> authService.changePassword(
                                id, new ChangePasswordCommand("old", "new")))
                .isInstanceOf(NotFoundException.class);
    }

    // ── Phase 9 stubs (no-op now) ─────────────────────────────────────────────

    @Test
    void forgotPassword_stub_doesNotThrow() {
        authService.forgotPassword(new ForgotPasswordCommand("alice@example.com"));
    }

    @Test
    void resetPassword_stub_doesNotThrow() {
        authService.resetPassword(
                new ResetPasswordCommand("alice@example.com", "code123", "newPass", "newPass"));
    }

    @Test
    void verifyEmail_stub_doesNotThrow() {
        authService.verifyEmail(new VerifyEmailCommand("alice@example.com", "code123"));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User activeUser(UUID id, String email, String passwordHash) {
        return new User(
                id, email, "Alice", null, null, null, null, null,
                AppRole.CUSTOMER, UserStatus.ACTIVE, passwordHash, null, null);
    }

    private static <T> T argThat(java.util.function.Predicate<T> predicate) {
        return org.mockito.ArgumentMatchers.argThat(predicate::test);
    }
}
