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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.application.port.in.CreateRentalRequestUseCase.CreateRentalRequestCommand;
import vn.edu.hcmus.homestay.application.port.out.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@ExtendWith(MockitoExtension.class)
class RentalRequestServiceTest {

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private SaveRentalRequestPort saveRentalRequestPort;

    private RentalRequestService service;

    @BeforeEach
    void setUp() {
        service = new RentalRequestService(loadRentalRequestPort, saveRentalRequestPort);
    }

    // ── createRentalRequest ───────────────────────────────────────────────────

    @Test
    void createRentalRequest_saves_withRequestedStatus() {
        UUID customerId = UUID.randomUUID();
        RentalRequest saved = rentalRequest(UUID.randomUUID(), customerId, RentalRequestStatus.REQUESTED);
        when(saveRentalRequestPort.save(any())).thenReturn(saved);

        RentalRequest result = service.createRentalRequest(
                new CreateRentalRequestCommand(customerId, null, null, null, null, null, null, 1, null));

        assertThat(result.getStatus()).isEqualTo(RentalRequestStatus.REQUESTED);
        verify(saveRentalRequestPort).save(any(RentalRequest.class));
    }

    // ── getRentalRequest ──────────────────────────────────────────────────────

    @Test
    void getRentalRequest_owner_allowed() {
        UUID customerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        RentalRequest req = rentalRequest(requestId, customerId, RentalRequestStatus.REQUESTED);
        when(loadRentalRequestPort.loadById(requestId)).thenReturn(Optional.of(req));
        UserPrincipal caller = new UserPrincipal(customerId, "customer@example.com", AppRole.CUSTOMER);

        RentalRequest result = service.getRentalRequest(requestId, caller);

        assertThat(result).isEqualTo(req);
    }

    @Test
    void getRentalRequest_staff_allowed() {
        UUID customerId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        RentalRequest req = rentalRequest(requestId, customerId, RentalRequestStatus.REQUESTED);
        when(loadRentalRequestPort.loadById(requestId)).thenReturn(Optional.of(req));
        UserPrincipal caller = new UserPrincipal(staffId, "sale@example.com", AppRole.SALE);

        RentalRequest result = service.getRentalRequest(requestId, caller);

        assertThat(result).isEqualTo(req);
    }

    @Test
    void getRentalRequest_otherCustomer_throwsForbidden() {
        UUID ownerId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        RentalRequest req = rentalRequest(requestId, ownerId, RentalRequestStatus.REQUESTED);
        when(loadRentalRequestPort.loadById(requestId)).thenReturn(Optional.of(req));
        UserPrincipal caller = new UserPrincipal(otherId, "other@example.com", AppRole.CUSTOMER);

        assertThatThrownBy(() -> service.getRentalRequest(requestId, caller))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void getRentalRequest_notFound_throwsNotFoundException() {
        UUID requestId = UUID.randomUUID();
        when(loadRentalRequestPort.loadById(requestId)).thenReturn(Optional.empty());
        UserPrincipal caller = new UserPrincipal(UUID.randomUUID(), "sale@example.com", AppRole.SALE);

        assertThatThrownBy(() -> service.getRentalRequest(requestId, caller))
                .isInstanceOf(NotFoundException.class);
    }

    // ── getMyRentalRequests ───────────────────────────────────────────────────

    @Test
    void getMyRentalRequests_returnsOwnRequests() {
        UUID customerId = UUID.randomUUID();
        RentalRequest r1 = rentalRequest(UUID.randomUUID(), customerId, RentalRequestStatus.REQUESTED);
        RentalRequest r2 = rentalRequest(UUID.randomUUID(), customerId, RentalRequestStatus.REVIEWING);
        when(loadRentalRequestPort.loadByCustomerId(customerId)).thenReturn(List.of(r1, r2));

        List<RentalRequest> result = service.getMyRentalRequests(customerId);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(r -> r.getCustomerId().equals(customerId));
    }

    // ── getAllRentalRequests ───────────────────────────────────────────────────

    @Test
    void getAllRentalRequests_returnsAll() {
        when(loadRentalRequestPort.loadAll()).thenReturn(
                List.of(rentalRequest(UUID.randomUUID(), UUID.randomUUID(), RentalRequestStatus.REQUESTED)));

        List<RentalRequest> result = service.getAllRentalRequests();

        assertThat(result).hasSize(1);
    }

    // ── updateStatus ──────────────────────────────────────────────────────────

    @Test
    void updateStatus_updatesAndSaves() {
        UUID requestId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        RentalRequest existing = rentalRequest(requestId, customerId, RentalRequestStatus.REQUESTED);
        RentalRequest updated = existing.withStatus(RentalRequestStatus.REVIEWING);
        when(loadRentalRequestPort.loadById(requestId)).thenReturn(Optional.of(existing));
        when(saveRentalRequestPort.save(any())).thenReturn(updated);

        RentalRequest result = service.updateStatus(requestId, RentalRequestStatus.REVIEWING);

        assertThat(result.getStatus()).isEqualTo(RentalRequestStatus.REVIEWING);
        verify(saveRentalRequestPort).save(any(RentalRequest.class));
    }

    @Test
    void updateStatus_notFound_throwsNotFoundException() {
        UUID requestId = UUID.randomUUID();
        when(loadRentalRequestPort.loadById(requestId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateStatus(requestId, RentalRequestStatus.REVIEWING))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RentalRequest rentalRequest(UUID id, UUID customerId, RentalRequestStatus status) {
        return new RentalRequest(
                id, customerId, null, null, null, null, null, null,
                1, null, status, Instant.now(), Instant.now());
    }
}
