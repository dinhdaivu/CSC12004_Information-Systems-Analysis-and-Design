package vn.edu.hcmus.homestay.application.service.rental;

import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.UpdateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadViewingAppointmentPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveViewingAppointmentPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

@Service
public class ViewingAppointmentService
        implements CreateViewingAppointmentUseCase,
                GetViewingAppointmentUseCase,
                UpdateViewingAppointmentUseCase {

    private static final Logger log = LoggerFactory.getLogger(ViewingAppointmentService.class);

    private final LoadViewingAppointmentPort loadViewingAppointmentPort;
    private final SaveViewingAppointmentPort saveViewingAppointmentPort;
    private final LoadRentalRequestPort loadRentalRequestPort;
    private final LoadUserPort loadUserPort;
    private final LoadRoomPort loadRoomPort;
    private final EmailPort emailPort;

    public ViewingAppointmentService(
            LoadViewingAppointmentPort loadViewingAppointmentPort,
            SaveViewingAppointmentPort saveViewingAppointmentPort,
            LoadRentalRequestPort loadRentalRequestPort,
            LoadUserPort loadUserPort,
            LoadRoomPort loadRoomPort,
            EmailPort emailPort) {
        this.loadViewingAppointmentPort = loadViewingAppointmentPort;
        this.saveViewingAppointmentPort = saveViewingAppointmentPort;
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.loadUserPort = loadUserPort;
        this.loadRoomPort = loadRoomPort;
        this.emailPort = emailPort;
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
        ViewingAppointment cancelled =
                saveViewingAppointmentPort.save(existing.withStatus(ViewingAppointmentStatus.CANCELLED));

        try {
            if (existing.getCustomerId() != null) {
                String roomLabel = resolveRoomLabel(existing.getRoomId());
                loadUserPort.loadById(existing.getCustomerId()).ifPresent(user -> {
                    emailPort.sendViewingDeclined(
                            user.getEmail(), user.getFullName(), roomLabel, "Appointment cancelled");
                });
            }
        } catch (Exception ex) {
            log.warn("Failed to send viewing declined email for appointment {}: {}",
                    id, ex.getMessage());
        }

        return cancelled;
    }

    @Override
    public ViewingAppointment recordOutcome(UUID id, RecordOutcomeCommand command) {
        ViewingAppointment existing = loadViewingAppointmentPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Viewing appointment not found"));
        ViewingAppointment updated =
                saveViewingAppointmentPort.save(existing.withOutcome(command.resultNote(), command.status()));

        if (command.status() == ViewingAppointmentStatus.COMPLETED) {
            try {
                if (existing.getCustomerId() != null) {
                    String roomLabel = resolveRoomLabel(existing.getRoomId());
                    String branchName = "";
                    loadUserPort.loadById(existing.getCustomerId()).ifPresent(user -> {
                        emailPort.sendViewingApproved(
                                user.getEmail(),
                                user.getFullName(),
                                existing.getScheduledAt(),
                                roomLabel,
                                "Homestay Dorm");
                    });
                }
            } catch (Exception ex) {
                log.warn("Failed to send viewing approved email for appointment {}: {}",
                        id, ex.getMessage());
            }
        }

        return updated;
    }

    @Override
    public ViewingAppointment updateAppointment(UUID id, UpdateAppointmentCommand command) {
        ViewingAppointment existing = loadViewingAppointmentPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Viewing appointment not found"));
        return saveViewingAppointmentPort.save(
                existing.withUpdates(
                        command.saleId(), command.roomId(), command.bedId(), command.scheduledAt()));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String resolveRoomLabel(UUID roomId) {
        if (roomId == null) {
            return "Room";
        }
        return loadRoomPort.loadById(roomId)
                .map(r -> r.getRoomNumber())
                .orElse("Room");
    }
}
