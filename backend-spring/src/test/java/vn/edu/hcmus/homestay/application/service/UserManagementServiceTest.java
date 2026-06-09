package vn.edu.hcmus.homestay.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import vn.edu.hcmus.homestay.application.port.in.ListUsersUseCase.ListUsersQuery;
import vn.edu.hcmus.homestay.application.port.in.UpdateUserUseCase.UpdateUserCommand;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveUserPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.common.exception.ValidationException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private SaveUserPort saveUserPort;

    private UserManagementService service;

    @BeforeEach
    void setUp() {
        service = new UserManagementService(loadUserPort, saveUserPort);
    }

    // ── listUsers ─────────────────────────────────────────────────────────────

    @Test
    void listUsers_returnsPage() {
        User u1 = user(UUID.randomUUID(), "alice@example.com", AppRole.CUSTOMER, UserStatus.ACTIVE);
        User u2 = user(UUID.randomUUID(), "bob@example.com", AppRole.SALE, UserStatus.ACTIVE);
        Page<User> fakePage = new PageImpl<>(List.of(u1, u2), PageRequest.of(0, 20), 2);
        when(loadUserPort.loadWithFilters(null, null, null, 1, 20)).thenReturn(fakePage);

        Page<User> result = service.listUsers(new ListUsersQuery(null, null, null, 1, 20));

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    // ── getUserById ───────────────────────────────────────────────────────────

    @Test
    void getUserById_found_returnsUser() {
        UUID id = UUID.randomUUID();
        User expected = user(id, "alice@example.com", AppRole.CUSTOMER, UserStatus.ACTIVE);
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(expected));

        User result = service.getUserById(id);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void getUserById_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadUserPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getUserById(id))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("User not found");
    }

    // ── updateUser ────────────────────────────────────────────────────────────

    @Test
    void updateUser_role_updatesRole() {
        UUID id = UUID.randomUUID();
        User existing = user(id, "alice@example.com", AppRole.CUSTOMER, UserStatus.ACTIVE);
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveUserPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = service.updateUser(id, new UpdateUserCommand(AppRole.SALE, null));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(saveUserPort).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(AppRole.SALE);
        assertThat(captor.getValue().getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(result.getRole()).isEqualTo(AppRole.SALE);
    }

    @Test
    void updateUser_status_updatesStatus() {
        UUID id = UUID.randomUUID();
        User existing = user(id, "alice@example.com", AppRole.CUSTOMER, UserStatus.ACTIVE);
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveUserPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.updateUser(id, new UpdateUserCommand(null, UserStatus.BANNED));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(saveUserPort).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(UserStatus.BANNED);
        assertThat(captor.getValue().getRole()).isEqualTo(AppRole.CUSTOMER);
    }

    @Test
    void updateUser_bothNull_throwsValidationException() {
        UUID id = UUID.randomUUID();

        assertThatThrownBy(() -> service.updateUser(id, new UpdateUserCommand(null, null)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("At least one field");
    }

    // ── deactivateUser ────────────────────────────────────────────────────────

    @Test
    void deactivateUser_setsInactive() {
        UUID id = UUID.randomUUID();
        User existing = user(id, "alice@example.com", AppRole.CUSTOMER, UserStatus.ACTIVE);
        when(loadUserPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveUserPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = service.deactivateUser(id);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(saveUserPort).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(UserStatus.INACTIVE);
        assertThat(result.getStatus()).isEqualTo(UserStatus.INACTIVE);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User user(UUID id, String email, AppRole role, UserStatus status) {
        return new User(
                id, email, "Full Name", null, null, null, null, null,
                role, status, "hashed", Instant.now(), Instant.now());
    }
}
