package vn.edu.hcmus.homestay.application.service.rental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
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
import java.util.List;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateViewingAppointmentUseCase.CreateViewingAppointmentCommand;
import vn.edu.hcmus.homestay.application.port.in.rental.UpdateViewingAppointmentUseCase.RecordOutcomeCommand;
import vn.edu.hcmus.homestay.application.port.in.rental.UpdateViewingAppointmentUseCase.UpdateAppointmentCommand;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadViewingAppointmentPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveViewingAppointmentPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

@ExtendWith(MockitoExtension.class)
class ViewingAppointmentServiceTest {

    @Mock
    private LoadViewingAppointmentPort loadViewingAppointmentPort;

    @Mock
    private SaveViewingAppointmentPort saveViewingAppointmentPort;

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private LoadRoomPort loadRoomPort;

    @Mock
    private EmailPort emailPort;

    private ViewingAppointmentService service;

    @BeforeEach
    void setUp() {
        service = new ViewingAppointmentService(
                loadViewingAppointmentPort,
                saveViewingAppointmentPort,
                loadRentalRequestPort,
                loadUserPort,
                loadRoomPort,
                emailPort);
        lenient().when(loadUserPort.loadById(any())).thenReturn(Optional.empty());
        lenient().when(loadRoomPort.loadById(any())).thenReturn(Optional.empty());
    }

    // ── createViewingAppointment ──────────────────────────────────────────────

    @Test
    void createViewingAppointment_rentalRequestNotFound_throws() {
        UUID rentalRequestId = UUID.randomUUID();
        when(loadRentalRequestPort.loadById(rentalRequestId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createViewingAppointment(
                        new CreateViewingAppointmentCommand(
                                rentalRequestId, UUID.randomUUID(), null, null, null, Instant.now())))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void createViewingAppointment_valid_saves() {
        UUID rentalRequestId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        RentalRequest rentalRequest = rentalRequest(rentalRequestId, customerId);
        ViewingAppointment saved = appointment(UUID.randomUUID(), rentalRequestId, customerId, ViewingAppointmentStatus.SCHEDULED);

        when(loadRentalRequestPort.loadById(rentalRequestId)).thenReturn(Optional.of(rentalRequest));
        when(saveViewingAppointmentPort.save(any())).thenReturn(saved);

        ViewingAppointment result = service.createViewingAppointment(
                new CreateViewingAppointmentCommand(
                        rentalRequestId, customerId, null, null, null, Instant.now()));

        assertThat(result.getStatus()).isEqualTo(ViewingAppointmentStatus.SCHEDULED);
        verify(saveViewingAppointmentPort).save(any(ViewingAppointment.class));
    }

    // ── getViewingAppointment ─────────────────────────────────────────────────

    @Test
    void getViewingAppointment_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getViewingAppointment(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── cancelAppointment ─────────────────────────────────────────────────────

    @Test
    void cancelAppointment_setsCancelledStatus() {
        UUID id = UUID.randomUUID();
        UUID rentalRequestId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        ViewingAppointment existing = appointment(id, rentalRequestId, customerId, ViewingAppointmentStatus.SCHEDULED);
        ViewingAppointment cancelled = existing.withStatus(ViewingAppointmentStatus.CANCELLED);

        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveViewingAppointmentPort.save(any())).thenReturn(cancelled);

        ViewingAppointment result = service.cancelAppointment(id);

        assertThat(result.getStatus()).isEqualTo(ViewingAppointmentStatus.CANCELLED);
        verify(saveViewingAppointmentPort).save(any(ViewingAppointment.class));
    }

    // ── recordOutcome ─────────────────────────────────────────────────────────

    @Test
    void recordOutcome_setsStatusAndNote() {
        UUID id = UUID.randomUUID();
        UUID rentalRequestId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        ViewingAppointment existing = appointment(id, rentalRequestId, customerId, ViewingAppointmentStatus.SCHEDULED);
        ViewingAppointment completed = existing.withOutcome("Room looks good", ViewingAppointmentStatus.COMPLETED);

        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveViewingAppointmentPort.save(any())).thenReturn(completed);

        ViewingAppointment result = service.recordOutcome(
                id, new RecordOutcomeCommand("Room looks good", ViewingAppointmentStatus.COMPLETED));

        assertThat(result.getStatus()).isEqualTo(ViewingAppointmentStatus.COMPLETED);
        assertThat(result.getResultNote()).isEqualTo("Room looks good");
        verify(saveViewingAppointmentPort).save(any(ViewingAppointment.class));
    }

    // ── getAllViewingAppointments ──────────────────────────────────────────────

    @Test
    void getAllViewingAppointments_returnsAll() {
        UUID id = UUID.randomUUID();
        when(loadViewingAppointmentPort.loadAll())
                .thenReturn(List.of(appointment(id, UUID.randomUUID(), UUID.randomUUID(),
                        ViewingAppointmentStatus.SCHEDULED)));

        List<ViewingAppointment> result = service.getAllViewingAppointments();

        assertThat(result).hasSize(1);
    }

    // ── cancelAppointment — not found ─────────────────────────────────────────

    @Test
    void cancelAppointment_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelAppointment(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── recordOutcome — not found ─────────────────────────────────────────────

    @Test
    void recordOutcome_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.recordOutcome(
                        id, new RecordOutcomeCommand("note", ViewingAppointmentStatus.COMPLETED)))
                .isInstanceOf(NotFoundException.class);
    }

    // ── updateAppointment ─────────────────────────────────────────────────────

    @Test
    void updateAppointment_updatesFields() {
        UUID id = UUID.randomUUID();
        UUID rentalRequestId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID newSaleId = UUID.randomUUID();
        Instant newTime = Instant.parse("2026-08-01T10:00:00Z");
        ViewingAppointment existing = appointment(id, rentalRequestId, customerId,
                ViewingAppointmentStatus.SCHEDULED);
        ViewingAppointment updated = existing.withUpdates(newSaleId, null, null, newTime);

        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveViewingAppointmentPort.save(any())).thenReturn(updated);

        ViewingAppointment result = service.updateAppointment(
                id, new UpdateAppointmentCommand(newSaleId, null, null, newTime));

        assertThat(result.getSaleId()).isEqualTo(newSaleId);
        assertThat(result.getScheduledAt()).isEqualTo(newTime);
        verify(saveViewingAppointmentPort).save(any(ViewingAppointment.class));
    }

    @Test
    void updateAppointment_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadViewingAppointmentPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateAppointment(
                        id, new UpdateAppointmentCommand(null, null, null, null)))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RentalRequest rentalRequest(UUID id, UUID customerId) {
        return new RentalRequest(
                id, customerId, null, null, null, null, null, null,
                1, null, RentalRequestStatus.REQUESTED, Instant.now(), Instant.now());
    }

    private ViewingAppointment appointment(
            UUID id, UUID rentalRequestId, UUID customerId, ViewingAppointmentStatus status) {
        return new ViewingAppointment(
                id, rentalRequestId, customerId, null, null, null,
                Instant.now(), null, status, Instant.now(), Instant.now());
    }
}
