package vn.edu.hcmus.homestay.application.service;

import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.ChangePasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.ForgotPasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetCurrentUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.LoginUseCase;
import vn.edu.hcmus.homestay.application.port.in.RegisterUseCase;
import vn.edu.hcmus.homestay.application.port.in.ResetPasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.VerifyEmailUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveUserPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.common.exception.UnauthorizedException;
import vn.edu.hcmus.homestay.common.exception.ValidationException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.application.port.out.TokenPort;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@Service
public class AuthService
        implements RegisterUseCase,
                LoginUseCase,
                GetCurrentUserUseCase,
                ChangePasswordUseCase,
                ForgotPasswordUseCase,
                ResetPasswordUseCase,
                VerifyEmailUseCase {

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final PasswordEncoder passwordEncoder;
    private final TokenPort tokenPort;

    public AuthService(
            LoadUserPort loadUserPort,
            SaveUserPort saveUserPort,
            PasswordEncoder passwordEncoder,
            TokenPort tokenPort) {
        this.loadUserPort = loadUserPort;
        this.saveUserPort = saveUserPort;
        this.passwordEncoder = passwordEncoder;
        this.tokenPort = tokenPort;
    }

    @Override
    public String register(RegisterCommand command) {
        String email = command.email().trim().toLowerCase();

        if (!command.password().equals(command.confirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        if (loadUserPort.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = new User(
                null,
                email,
                email.split("@")[0],
                null,
                null,
                null,
                null,
                null,
                AppRole.CUSTOMER,
                UserStatus.ACTIVE,
                passwordEncoder.encode(command.password()),
                null,
                null);
        saveUserPort.save(user);

        return email;
    }

    @Override
    public LoginResult login(LoginCommand command) {
        String email = command.email().trim().toLowerCase();

        User user = loadUserPort
                .loadByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is not active");
        }

        String token = tokenPort.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new LoginResult(token, user);
    }

    @Override
    public User getCurrentUser(UUID userId) {
        return loadUserPort
                .loadById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public void changePassword(UUID userId, ChangePasswordCommand command) {
        User user = loadUserPort
                .loadById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(command.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        User updated = user.withPasswordHash(passwordEncoder.encode(command.newPassword()));
        saveUserPort.save(updated);
    }

    public void logout() {
        // Stateless JWT — no server-side session to invalidate.
    }

    @Override
    public void forgotPassword(ForgotPasswordCommand command) {
        // TODO: generate reset token, persist it, send email via Resend (Phase 9).
    }

    @Override
    public void resetPassword(ResetPasswordCommand command) {
        // TODO: validate reset token, update password hash (Phase 9).
    }

    @Override
    public void verifyEmail(VerifyEmailCommand command) {
        // TODO: validate verification code, mark account as verified (Phase 9).
    }
}
