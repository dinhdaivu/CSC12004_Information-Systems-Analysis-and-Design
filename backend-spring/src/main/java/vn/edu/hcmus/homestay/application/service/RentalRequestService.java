package vn.edu.hcmus.homestay.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.application.port.in.CreateRentalRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetRentalRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateRentalRequestStatusUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@Service
public class RentalRequestService
        implements CreateRentalRequestUseCase, GetRentalRequestUseCase, UpdateRentalRequestStatusUseCase {

    private final LoadRentalRequestPort loadRentalRequestPort;
    private final SaveRentalRequestPort saveRentalRequestPort;

    public RentalRequestService(
            LoadRentalRequestPort loadRentalRequestPort,
            SaveRentalRequestPort saveRentalRequestPort) {
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.saveRentalRequestPort = saveRentalRequestPort;
    }

    @Override
    public RentalRequest createRentalRequest(CreateRentalRequestCommand command) {
        RentalRequest request = new RentalRequest(
                null,
                command.customerId(),
                command.branchId(),
                command.roomId(),
                command.bedId(),
                command.preferredRoomType(),
                command.budgetMin(),
                command.budgetMax(),
                command.peopleCount(),
                command.note(),
                RentalRequestStatus.REQUESTED,
                null,
                null);
        return saveRentalRequestPort.save(request);
    }

    @Override
    public RentalRequest getRentalRequest(UUID id, UserPrincipal caller) {
        RentalRequest req = loadRentalRequestPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Rental request not found"));

        boolean isOwner = req.getCustomerId().equals(caller.getId());
        boolean isStaff = caller.getRole() != AppRole.CUSTOMER;
        if (!isOwner && !isStaff) {
            throw new ForbiddenException("Access denied");
        }
        return req;
    }

    @Override
    public List<RentalRequest> getMyRentalRequests(UUID customerId) {
        return loadRentalRequestPort.loadByCustomerId(customerId);
    }

    @Override
    public List<RentalRequest> getAllRentalRequests() {
        return loadRentalRequestPort.loadAll();
    }

    @Override
    public RentalRequest updateStatus(UUID id, RentalRequestStatus newStatus) {
        RentalRequest existing = loadRentalRequestPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Rental request not found"));
        return saveRentalRequestPort.save(existing.withStatus(newStatus));
    }
}
