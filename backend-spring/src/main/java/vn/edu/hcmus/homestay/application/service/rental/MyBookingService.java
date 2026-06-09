package vn.edu.hcmus.homestay.application.service.rental;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.rental.GetMyBookingUseCase;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.storage.StoragePort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.application.model.query.MyBookingView;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@Service
public class MyBookingService implements GetMyBookingUseCase {

    private static final Logger log = LoggerFactory.getLogger(MyBookingService.class);

    private static final Set<RentalRequestStatus> CANCELLABLE_STATUSES = Set.of(
            RentalRequestStatus.REQUESTED,
            RentalRequestStatus.REVIEWING,
            RentalRequestStatus.VIEWING_SCHEDULED);

    private final LoadRentalRequestPort loadRentalRequestPort;
    private final LoadDepositPort loadDepositPort;
    private final LoadRoomPort loadRoomPort;
    private final LoadBedPort loadBedPort;
    private final LoadBranchPort loadBranchPort;
    private final SaveRentalRequestPort saveRentalRequestPort;
    private final SaveDepositPort saveDepositPort;
    private final LoadUserPort loadUserPort;
    private final EmailPort emailPort;
    private final StoragePort storagePort;

    public MyBookingService(
            LoadRentalRequestPort loadRentalRequestPort,
            LoadDepositPort loadDepositPort,
            LoadRoomPort loadRoomPort,
            LoadBedPort loadBedPort,
            LoadBranchPort loadBranchPort,
            SaveRentalRequestPort saveRentalRequestPort,
            SaveDepositPort saveDepositPort,
            LoadUserPort loadUserPort,
            EmailPort emailPort,
            StoragePort storagePort) {
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.loadDepositPort = loadDepositPort;
        this.loadRoomPort = loadRoomPort;
        this.loadBedPort = loadBedPort;
        this.loadBranchPort = loadBranchPort;
        this.saveRentalRequestPort = saveRentalRequestPort;
        this.saveDepositPort = saveDepositPort;
        this.loadUserPort = loadUserPort;
        this.emailPort = emailPort;
        this.storagePort = storagePort;
    }

    @Override
    public List<MyBookingView> getMyBookings(UUID customerId, String statusFilter) {
        List<RentalRequest> requests = loadRentalRequestPort.loadByCustomerId(customerId);

        if (statusFilter != null && !statusFilter.isBlank()) {
            Set<RentalRequestStatus> filterStatuses = resolveStatusFilter(statusFilter);
            requests = requests.stream()
                    .filter(r -> filterStatuses.contains(r.getStatus()))
                    .toList();
        }

        return requests.stream()
                .map(req -> assembleMyBooking(req, findDepositForRequest(req)))
                .toList();
    }

    @Override
    public MyBookingView getMyBooking(UUID bookingId, UUID customerId) {
        RentalRequest req = loadRentalRequestPort.loadById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!req.getCustomerId().equals(customerId)) {
            throw new ForbiddenException("Access denied");
        }

        return assembleMyBooking(req, findDepositForRequest(req));
    }

    @Override
    public boolean checkAvailability(UUID bookingId, UUID customerId) {
        RentalRequest req = loadRentalRequestPort.loadById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!req.getCustomerId().equals(customerId)) {
            throw new ForbiddenException("Access denied");
        }

        boolean available;
        if (req.getBedId() != null) {
            Optional<Bed> bed = loadBedPort.loadById(req.getBedId());
            available = bed.map(b -> b.getStatus() == BedStatus.AVAILABLE).orElse(false);
        } else if (req.getRoomId() != null) {
            Optional<Room> room = loadRoomPort.loadById(req.getRoomId());
            available = room.map(r -> r.getStatus() == RoomStatus.AVAILABLE).orElse(false);
        } else {
            available = false;
        }

        if (!available) {
            RentalRequest cancelled = req.withStatus(RentalRequestStatus.CANCELLED);
            saveRentalRequestPort.save(cancelled);

            findDepositForRequest(req).ifPresent(deposit -> {
                if (deposit.getStatus() == DepositStatus.PENDING) {
                    saveDepositPort.save(deposit.withStatus(DepositStatus.CANCELLED));
                }
            });
        }

        return available;
    }

    @Override
    public MyBookingView submitProof(UUID bookingId, UUID customerId, String proofImageUrl) {
        RentalRequest req = loadRentalRequestPort.loadById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!req.getCustomerId().equals(customerId)) {
            throw new ForbiddenException("Access denied");
        }

        // Upload base64 images to Cloudinary
        String finalProofUrl = proofImageUrl;
        if (proofImageUrl != null && proofImageUrl.startsWith("data:")) {
            try {
                String uploaded = storagePort.upload(
                        proofImageUrl, "homestay-dorm/deposits", "proof-" + bookingId);
                if (uploaded != null) {
                    finalProofUrl = uploaded;
                }
            } catch (Exception ex) {
                log.warn("Image upload failed for booking {}, using raw URL: {}",
                        bookingId, ex.getMessage());
            }
        }

        Optional<DepositRequest> existingDeposit = findDepositForRequest(req);

        DepositRequest deposit;
        if (existingDeposit.isPresent()) {
            deposit = existingDeposit.get().withProofImageUrl(finalProofUrl);
        } else {
            // Auto-create deposit when none exists
            Room room = req.getRoomId() != null
                    ? loadRoomPort.loadById(req.getRoomId()).orElse(null)
                    : null;
            java.math.BigDecimal amount = (room != null && room.getPricePerMonth() != null)
                    ? room.getPricePerMonth().multiply(java.math.BigDecimal.TWO)
                    : java.math.BigDecimal.ZERO;

            deposit = new DepositRequest(
                    null,
                    req.getId(),
                    req.getCustomerId(),
                    req.getRoomId(),
                    req.getBedId(),
                    amount,
                    Instant.now().plus(24, ChronoUnit.HOURS),
                    null,
                    finalProofUrl,
                    null,
                    null,
                    DepositStatus.PENDING,
                    null,
                    null);
        }

        DepositRequest savedDeposit = saveDepositPort.save(deposit);

        try {
            Room room = req.getRoomId() != null
                    ? loadRoomPort.loadById(req.getRoomId()).orElse(null)
                    : null;
            String roomLabel = room != null ? room.getRoomNumber() : "your room";
            loadUserPort.loadById(customerId).ifPresent(user -> {
                emailPort.sendDepositSubmitted(
                        user.getEmail(),
                        user.getFullName(),
                        roomLabel,
                        savedDeposit.getAmount(),
                        savedDeposit.getId());
            });
        } catch (Exception ex) {
            log.warn("Failed to send proof submitted email for booking {}: {}",
                    bookingId, ex.getMessage());
        }

        return assembleMyBooking(req, Optional.of(savedDeposit));
    }

    @Override
    public MyBookingView cancelBooking(UUID bookingId, UUID customerId) {
        RentalRequest req = loadRentalRequestPort.loadById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!req.getCustomerId().equals(customerId)) {
            throw new ForbiddenException("Access denied");
        }

        if (!CANCELLABLE_STATUSES.contains(req.getStatus())) {
            throw new ConflictException(
                    "Cannot cancel a booking with status: " + req.getStatus().name().toLowerCase());
        }

        RentalRequest cancelled = req.withStatus(RentalRequestStatus.CANCELLED);
        saveRentalRequestPort.save(cancelled);
        return assembleMyBooking(cancelled, findDepositForRequest(req));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Optional<DepositRequest> findDepositForRequest(RentalRequest req) {
        return loadDepositPort.loadAll().stream()
                .filter(d -> req.getId().equals(d.getRentalRequestId()))
                .findFirst();
    }

    private MyBookingView assembleMyBooking(RentalRequest req, Optional<DepositRequest> depositOpt) {
        Room room = req.getRoomId() != null
                ? loadRoomPort.loadById(req.getRoomId()).orElse(null)
                : null;

        Bed bed = req.getBedId() != null
                ? loadBedPort.loadById(req.getBedId()).orElse(null)
                : null;

        Branch branch = (room != null)
                ? loadBranchPort.loadById(room.getBranchId()).orElse(null)
                : null;

        DepositRequest deposit = depositOpt.orElse(null);

        return new MyBookingView(
                req.getId(),
                req.getCustomerId(),
                branch != null ? branch.getName() : null,
                branch != null ? branch.getAddress() : null,
                room != null ? room.getRoomNumber() : null,
                room != null ? room.getRoomType() : null,
                room != null ? room.getPricePerMonth() : null,
                bed != null ? bed.getBedNumber() : null,
                req.getPeopleCount(),
                req.getNote(),
                req.getStatus() != null ? req.getStatus().name().toLowerCase() : null,
                deposit != null ? deposit.getId() : null,
                deposit != null ? deposit.getAmount() : null,
                deposit != null && deposit.getStatus() != null
                        ? deposit.getStatus().name().toLowerCase()
                        : null,
                deposit != null ? deposit.getDueAt() : null,
                deposit != null ? deposit.getVietqrReference() : null,
                req.getCreatedAt(),
                req.getUpdatedAt());
    }

    private Set<RentalRequestStatus> resolveStatusFilter(String filter) {
        return switch (filter.toLowerCase()) {
            case "pending" -> Set.of(RentalRequestStatus.REQUESTED, RentalRequestStatus.REVIEWING);
            case "confirmed" -> Set.of(
                    RentalRequestStatus.VIEWING_SCHEDULED, RentalRequestStatus.ACCEPTED);
            case "deposit" -> Set.of(RentalRequestStatus.DEPOSIT_PENDING);
            case "completed" -> Set.of(RentalRequestStatus.COMPLETED);
            case "cancelled" -> Set.of(RentalRequestStatus.CANCELLED);
            case "rejected" -> Set.of(RentalRequestStatus.REJECTED);
            default -> Set.of(RentalRequestStatus.values());
        };
    }
}
