package vn.edu.hcmus.homestay.application.service.tenancy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.in.tenancy.CreateInspectionUseCase.CreateInspectionCommand;
import vn.edu.hcmus.homestay.application.port.out.tenancy.LoadInspectionPort;
import vn.edu.hcmus.homestay.application.port.out.tenancy.SaveInspectionPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspectionStatus;

@ExtendWith(MockitoExtension.class)
class InspectionServiceTest {

    @Mock
    private LoadInspectionPort loadInspectionPort;

    @Mock
    private SaveInspectionPort saveInspectionPort;

    private InspectionService service;

    @BeforeEach
    void setUp() {
        service = new InspectionService(loadInspectionPort, saveInspectionPort);
    }

    // ── getInspection ─────────────────────────────────────────────────────────

    @Test
    void getInspection_notFound_throwsNotFoundException() {
        UUID checkoutRequestId = UUID.randomUUID();
        when(loadInspectionPort.loadByCheckoutRequestId(checkoutRequestId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getInspection(checkoutRequestId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getInspection_found_returnsInspection() {
        UUID checkoutRequestId = UUID.randomUUID();
        CheckoutInspection inspection = inspection(checkoutRequestId);
        when(loadInspectionPort.loadByCheckoutRequestId(checkoutRequestId)).thenReturn(Optional.of(inspection));

        assertThat(service.getInspection(checkoutRequestId)).isEqualTo(inspection);
    }

    // ── createInspection ──────────────────────────────────────────────────────

    @Test
    void createInspection_alreadyExists_throwsConflictException() {
        UUID checkoutRequestId = UUID.randomUUID();
        when(loadInspectionPort.loadByCheckoutRequestId(checkoutRequestId))
                .thenReturn(Optional.of(inspection(checkoutRequestId)));

        assertThatThrownBy(() -> service.createInspection(checkoutRequestId,
                new CreateInspectionCommand(UUID.randomUUID(), "Clean", "Good", null)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void createInspection_new_savesAndReturns() {
        UUID checkoutRequestId = UUID.randomUUID();
        UUID managerId = UUID.randomUUID();
        CheckoutInspection saved = inspection(checkoutRequestId);
        when(loadInspectionPort.loadByCheckoutRequestId(checkoutRequestId)).thenReturn(Optional.empty());
        when(saveInspectionPort.save(any())).thenReturn(saved);

        CheckoutInspection result = service.createInspection(checkoutRequestId,
                new CreateInspectionCommand(managerId, "Clean", "Good", null));

        assertThat(result).isEqualTo(saved);
        verify(saveInspectionPort).save(any(CheckoutInspection.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CheckoutInspection inspection(UUID checkoutRequestId) {
        return new CheckoutInspection(
                UUID.randomUUID(), checkoutRequestId, UUID.randomUUID(),
                Instant.now(), "Clean", "Good",
                CheckoutInspectionStatus.PENDING, null,
                Instant.now(), Instant.now());
    }
}
