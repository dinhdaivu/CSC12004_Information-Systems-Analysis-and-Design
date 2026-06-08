package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.AuthResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.ChangePasswordRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.ForgotPasswordRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.LoginRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.RegisterRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.ResetPasswordRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UserResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.VerifyEmailRequest;
import vn.edu.hcmus.homestay.application.port.in.ChangePasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.ForgotPasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetCurrentUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.LoginUseCase;
import vn.edu.hcmus.homestay.application.port.in.RegisterUseCase;
import vn.edu.hcmus.homestay.application.port.in.ResetPasswordUseCase;
import vn.edu.hcmus.homestay.application.port.in.VerifyEmailUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final ForgotPasswordUseCase forgotPasswordUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;

    public AuthController(
            RegisterUseCase registerUseCase,
            LoginUseCase loginUseCase,
            GetCurrentUserUseCase getCurrentUserUseCase,
            ChangePasswordUseCase changePasswordUseCase,
            ForgotPasswordUseCase forgotPasswordUseCase,
            ResetPasswordUseCase resetPasswordUseCase,
            VerifyEmailUseCase verifyEmailUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.getCurrentUserUseCase = getCurrentUserUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest req) {
        String email = registerUseCase.register(
                new RegisterUseCase.RegisterCommand(req.getEmail(), req.getPassword(), req.getConfirmPassword()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseBuilder.success(
                        java.util.Map.of("email", email),
                        "Registration successful. Please log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        LoginUseCase.LoginResult result = loginUseCase.login(
                new LoginUseCase.LoginCommand(req.getEmail(), req.getPassword()));
        AuthResponse data = new AuthResponse(result.token(), UserResponse.from(result.user()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Stateless JWT — no server-side session to invalidate.
        return ResponseEntity.ok(ApiResponseBuilder.success(null, "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refresh() {
        // Refresh tokens are not implemented — stateless JWT only.
        return ResponseEntity.ok(
                ApiResponseBuilder.success(null, "Refresh tokens are not supported"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getCurrentUserUseCase.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponseBuilder.success(UserResponse.from(user)));
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest req) {
        changePasswordUseCase.changePassword(
                principal.getId(),
                new ChangePasswordUseCase.ChangePasswordCommand(
                        req.getCurrentPassword(), req.getNewPassword()));
        return ResponseEntity.ok(ApiResponseBuilder.success(null, "Password changed successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req) {
        forgotPasswordUseCase.forgotPassword(new ForgotPasswordUseCase.ForgotPasswordCommand(req.getEmail()));
        return ResponseEntity.ok(
                ApiResponseBuilder.success(
                        null, "If that email is registered you will receive a reset link"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        resetPasswordUseCase.resetPassword(
                new ResetPasswordUseCase.ResetPasswordCommand(
                        req.getEmail(), req.getCode(), req.getPassword(), req.getConfirmPassword()));
        return ResponseEntity.ok(ApiResponseBuilder.success(null, "Password reset successful"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest req) {
        verifyEmailUseCase.verifyEmail(
                new VerifyEmailUseCase.VerifyEmailCommand(req.getEmail(), req.getCode()));
        return ResponseEntity.ok(ApiResponseBuilder.success(null, "Email verified successfully"));
    }
}
