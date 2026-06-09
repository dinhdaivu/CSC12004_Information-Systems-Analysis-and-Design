package vn.edu.hcmus.homestay.application.service;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.DeactivateUserUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetUserByIdUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListUsersUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateUserUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveUserPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.common.exception.ValidationException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@Service
public class UserManagementService
        implements ListUsersUseCase, GetUserByIdUseCase, UpdateUserUseCase, DeactivateUserUseCase {

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;

    public UserManagementService(LoadUserPort loadUserPort, SaveUserPort saveUserPort) {
        this.loadUserPort = loadUserPort;
        this.saveUserPort = saveUserPort;
    }

    @Override
    public Page<User> listUsers(ListUsersQuery query) {
        return loadUserPort.loadWithFilters(
                query.search(), query.role(), query.status(), query.page(), query.limit());
    }

    @Override
    public User getUserById(UUID id) {
        return loadUserPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    @Transactional
    public User updateUser(UUID id, UpdateUserCommand command) {
        if (command.role() == null && command.status() == null) {
            throw new ValidationException("At least one field (role or status) is required");
        }

        User existing = loadUserPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        AppRole newRole = command.role() != null ? command.role() : existing.getRole();
        UserStatus newStatus = command.status() != null ? command.status() : existing.getStatus();

        User updated = new User(
                existing.getId(),
                existing.getEmail(),
                existing.getFullName(),
                existing.getPhoneNumber(),
                existing.getIdentityNumber(),
                existing.getGender(),
                existing.getNationality(),
                existing.getAvatarUrl(),
                newRole,
                newStatus,
                existing.getPasswordHash(),
                existing.getCreatedAt(),
                existing.getUpdatedAt());

        return saveUserPort.save(updated);
    }

    @Override
    @Transactional
    public User deactivateUser(UUID id) {
        User existing = loadUserPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        User deactivated = new User(
                existing.getId(),
                existing.getEmail(),
                existing.getFullName(),
                existing.getPhoneNumber(),
                existing.getIdentityNumber(),
                existing.getGender(),
                existing.getNationality(),
                existing.getAvatarUrl(),
                existing.getRole(),
                UserStatus.INACTIVE,
                existing.getPasswordHash(),
                existing.getCreatedAt(),
                existing.getUpdatedAt());

        return saveUserPort.save(deactivated);
    }
}
