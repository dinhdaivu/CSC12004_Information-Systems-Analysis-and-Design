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
import vn.edu.hcmus.homestay.application.port.in.ManageDisputeUseCase.CreateDisputeCommand;
import vn.edu.hcmus.homestay.application.port.in.ManageDisputeUseCase.ResolveDisputeCommand;
import vn.edu.hcmus.homestay.application.port.out.LoadDisputePort;
import vn.edu.hcmus.homestay.application.port.out.SaveDisputePort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock
    private LoadDisputePort loadDisputePort;

    @Mock
    private SaveDisputePort saveDisputePort;

    private DisputeService disputeService;

    @BeforeEach
    void setUp() {
        disputeService = new DisputeService(loadDisputePort, saveDisputePort);
    }

    @Test
    void createDispute_savesWithPendingStatus() {
        UUID customerId = UUID.randomUUID();
        when(saveDisputePort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateDisputeCommand cmd = new CreateDisputeCommand(
                customerId, null, null, "John Doe", "Branch A", "Wrong calculation", null);

        Dispute result = disputeService.createDispute(cmd);

        assertThat(result.getStatus()).isEqualTo(DisputeStatus.PENDING);
        assertThat(result.getCustomerId()).isEqualTo(customerId);
        assertThat(result.getName()).isEqualTo("John Doe");
        verify(saveDisputePort).save(any());
    }

    @Test
    void listDisputes_customer_returnsOwn() {
        UUID customerId = UUID.randomUUID();
        when(loadDisputePort.loadByCustomerId(customerId)).thenReturn(List.of());

        disputeService.listDisputes(customerId, false);

        verify(loadDisputePort).loadByCustomerId(customerId);
    }

    @Test
    void listDisputes_staff_returnsAll() {
        UUID staffId = UUID.randomUUID();
        when(loadDisputePort.loadAll()).thenReturn(List.of());

        disputeService.listDisputes(staffId, true);

        verify(loadDisputePort).loadAll();
    }

    @Test
    void resolveDispute_setsStatusAndResolution() {
        UUID disputeId = UUID.randomUUID();
        UUID resolvedBy = UUID.randomUUID();
        Dispute existing = dispute(disputeId, UUID.randomUUID(), DisputeStatus.PENDING);

        when(loadDisputePort.loadById(disputeId)).thenReturn(Optional.of(existing));
        when(saveDisputePort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResolveDisputeCommand cmd = new ResolveDisputeCommand(resolvedBy, DisputeStatus.RESOLVED, "Issue clarified");

        Dispute result = disputeService.resolveDispute(disputeId, cmd);

        assertThat(result.getStatus()).isEqualTo(DisputeStatus.RESOLVED);
        assertThat(result.getResolvedBy()).isEqualTo(resolvedBy);
        assertThat(result.getResolutionNote()).isEqualTo("Issue clarified");
        assertThat(result.getResolvedAt()).isNotNull();
    }

    @Test
    void getDispute_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadDisputePort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> disputeService.getDispute(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Dispute dispute(UUID id, UUID customerId, DisputeStatus status) {
        return new Dispute(
                id, null, null, customerId, "Test User", null,
                "Test reason", null, status, null, null, null,
                Instant.now(), Instant.now());
    }
}
