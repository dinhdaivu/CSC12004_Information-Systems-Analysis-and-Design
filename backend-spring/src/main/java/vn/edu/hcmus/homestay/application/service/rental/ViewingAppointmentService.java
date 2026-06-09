package vn.edu.hcmus.homestay.application.service.rental;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.UpdateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadViewingAppointmentPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveViewingAppointmentPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

@Service
public class ViewingAppointmentService
        implements CreateViewingAppointmentUseCase, GetViewingAppointmentUseCase, UpdateViewingAppointmentUseCase {

    private final LoadViewingAppointmentPort loadViewingAppointmentPort;
    private final SaveViewingAppointmentPort saveViewingAppointmentPort;
    private final LoadRentalRequestPort loadRentalRequestPort;

    public ViewingAppointmentService(
            LoadViewingAppointmentPort loadViewingAppointmentPort,
            SaveViewingAppointmentPort saveViewingAppointmentPort,
            LoadRentalRequestPort loadRentalRequestPort) {
        this.loadViewingAppointmentPort = loadViewingAppointmentPort;
        this.saveViewingAppointmentPort = saveViewingAppointmentPort;
        this.loadRentalRequestPort = loadRentalRequestPort;
    }

    @Override
    public ViewingAppointment createViewingAppointment(CreateViewingAppointmentCommand command) {
        loadRentalRequestPort
                .loadById(command.rentalRequestId())
                .orElseThrow(() -> new NotFoundException("Rental request not found"));

        ViewingAppointment appointment = new ViewingAppointment(
                null,
                command.rentalRequestId(),
                command.customerId(),
                command.saleId(),
                command.roomId(),
                command.bedId(),
                command.scheduledAt(),
                null,
                ViewingAppointmentStatus.SCHEDULED,
                null,
                null);
        return saveViewingAppointmentPort.save(appointment);
    }

    @Override
    public ViewingAppointment getViewingAppointment(UUID id) {
        return loadViewingAppointmentPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Viewing appointment not found"));
    }

    @Override
    public List<ViewingAppointment> getAllViewingAppointments() {
        return loadViewingAppointmentPort.loadAll();
    }

    @Override
    public ViewingAppointment cancelAppointment(UUID id) {
        ViewingAppointment existing = loadViewingAppointmentPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Viewing appointment not found"));
        return saveViewingAppointmentPort.save(existing.withStatus(ViewingAppointmentStatus.CANCELLED));
    }

    @Override
    public ViewingAppointment recordOutcome(UUID id, RecordOutcomeCommand command) {
        ViewingAppointment existing = loadViewingAppointmentPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Viewing appointment not found"));
        return saveViewingAppointmentPort.save(existing.withOutcome(command.resultNote(), command.status()));
    }

    @Override
    public ViewingAppointment updateAppointment(UUID id, UpdateAppointmentCommand command) {
        ViewingAppointment existing = loadViewingAppointmentPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Viewing appointment not found"));
        return saveViewingAppointmentPort.save(
                existing.withUpdates(command.saleId(), command.roomId(), command.bedId(), command.scheduledAt()));
    }
}
