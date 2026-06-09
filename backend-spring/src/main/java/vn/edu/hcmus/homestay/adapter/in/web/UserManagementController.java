package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UpdateUserRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UserResponse;
import vn.edu.hcmus.homestay.application.port.in.DeactivateUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetUserByIdUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListUsersUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListUsersUseCase.ListUsersQuery;
import vn.edu.hcmus.homestay.application.port.in.UpdateUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateUserUseCase.UpdateUserCommand;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;
import vn.edu.hcmus.homestay.common.PaginatedResponse;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class UserManagementController {

    private final ListUsersUseCase listUsersUseCase;
    private final GetUserByIdUseCase getUserByIdUseCase;
    private final UpdateUserUseCase updateUserUseCase;
    private final DeactivateUserUseCase deactivateUserUseCase;

    public UserManagementController(
            ListUsersUseCase listUsersUseCase,
            GetUserByIdUseCase getUserByIdUseCase,
            UpdateUserUseCase updateUserUseCase,
            DeactivateUserUseCase deactivateUserUseCase) {
        this.listUsersUseCase = listUsersUseCase;
        this.getUserByIdUseCase = getUserByIdUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.deactivateUserUseCase = deactivateUserUseCase;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<UserResponse>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        AppRole parsedRole = (role != null && !role.isBlank())
                ? AppRole.valueOf(role.toUpperCase())
                : null;
        UserStatus parsedStatus = (status != null && !status.isBlank())
                ? UserStatus.valueOf(status.toUpperCase())
                : null;

        Page<User> resultPage = listUsersUseCase.listUsers(
                new ListUsersQuery(search, parsedRole, parsedStatus, page, limit));

        int totalPages = resultPage.getTotalPages();
        PaginatedResponse<UserResponse> response = new PaginatedResponse<>(
                resultPage.getContent().stream().map(UserResponse::from).toList(),
                new PaginatedResponse.Pagination(page, limit, resultPage.getTotalElements(), totalPages));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        User user = getUserByIdUseCase.getUserById(id);
        return ResponseEntity.ok(ApiResponseBuilder.success(UserResponse.from(user)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID id, @Valid @RequestBody UpdateUserRequest req) {
        AppRole parsedRole = (req.getRole() != null && !req.getRole().isBlank())
                ? AppRole.valueOf(req.getRole().toUpperCase())
                : null;
        UserStatus parsedStatus = (req.getStatus() != null && !req.getStatus().isBlank())
                ? UserStatus.valueOf(req.getStatus().toUpperCase())
                : null;

        User updated = updateUserUseCase.updateUser(id, new UpdateUserCommand(parsedRole, parsedStatus));
        return ResponseEntity.ok(ApiResponseBuilder.success(UserResponse.from(updated)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable UUID id) {
        User deactivated = deactivateUserUseCase.deactivateUser(id);
        return ResponseEntity.ok(ApiResponseBuilder.success(UserResponse.from(deactivated)));
    }
}
