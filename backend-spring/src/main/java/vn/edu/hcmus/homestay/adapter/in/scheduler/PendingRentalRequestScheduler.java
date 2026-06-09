package vn.edu.hcmus.homestay.adapter.in.scheduler;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.room.GenderPolicy;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;
import vn.edu.hcmus.homestay.domain.model.user.User;

@Component
public class PendingRentalRequestScheduler {

    private static final Logger log = LoggerFactory.getLogger(PendingRentalRequestScheduler.class);

    private final LoadRentalRequestPort loadRentalRequestPort;
    private final SaveRentalRequestPort saveRentalRequestPort;
    private final SaveDepositPort saveDepositPort;
    private final LoadRoomPort loadRoomPort;
    private final LoadBedPort loadBedPort;
    private final LoadUserPort loadUserPort;
    private final EmailPort emailPort;

    public PendingRentalRequestScheduler(
            LoadRentalRequestPort loadRentalRequestPort,
            SaveRentalRequestPort saveRentalRequestPort,
            SaveDepositPort saveDepositPort,
            LoadRoomPort loadRoomPort,
            LoadBedPort loadBedPort,
            LoadUserPort loadUserPort,
            EmailPort emailPort) {
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.saveRentalRequestPort = saveRentalRequestPort;
        this.saveDepositPort = saveDepositPort;
        this.loadRoomPort = loadRoomPort;
        this.loadBedPort = loadBedPort;
        this.loadUserPort = loadUserPort;
        this.emailPort = emailPort;
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processPendingRentalRequests() {
        List<RentalRequest> pending =
                loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED);
        if (pending.isEmpty()) {
            return;
        }
        log.info("Processing {} pending rental request(s)", pending.size());
        for (RentalRequest req : pending) {
            boolean available = checkAvailability(req);
            boolean genderOk = checkGenderPolicy(req);
            if (available && genderOk) {
                acceptRequest(req);
            } else {
                rejectRequest(req, available ? "Gender policy mismatch" : "Room/bed not available");
            }
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private boolean checkAvailability(RentalRequest req) {
        if (req.getBedId() != null) {
            return loadBedPort
                    .loadById(req.getBedId())
                    .map(b -> b.getStatus() == BedStatus.AVAILABLE)
                    .orElse(false);
        }
        if (req.getRoomId() != null) {
            return loadRoomPort
                    .loadById(req.getRoomId())
                    .map(r -> r.getStatus() == RoomStatus.AVAILABLE)
                    .orElse(false);
        }
        return false;
    }

    private boolean checkGenderPolicy(RentalRequest req) {
        if (req.getRoomId() == null) {
            return true;
        }
        Room room = loadRoomPort.loadById(req.getRoomId()).orElse(null);
        if (room == null || room.getGenderPolicy() == null
                || room.getGenderPolicy() == GenderPolicy.MIXED) {
            return true;
        }
        User user = loadUserPort.loadById(req.getCustomerId()).orElse(null);
        if (user == null || user.getGender() == null) {
            return true;
        }
        String userGender = user.getGender().toUpperCase();
        return room.getGenderPolicy().name().equals(userGender);
    }

    private void acceptRequest(RentalRequest req) {
        BigDecimal price = resolvePrice(req);
        Instant dueAt = Instant.now().plus(24, ChronoUnit.HOURS);

        DepositRequest deposit = new DepositRequest(
                null,
                req.getId(),
                req.getCustomerId(),
                req.getRoomId(),
                req.getBedId(),
                price.multiply(BigDecimal.TWO),
                dueAt,
                null,
                null,
                null,
                null,
                DepositStatus.PENDING,
                null,
                null);
        DepositRequest saved = saveDepositPort.save(deposit);
        saveRentalRequestPort.save(req.withStatus(RentalRequestStatus.DEPOSIT_PENDING));

        try {
            loadUserPort.loadById(req.getCustomerId()).ifPresent(user -> {
                String roomLabel = resolveRoomLabel(req);
                emailPort.sendDepositInstruction(
                        user.getEmail(),
                        user.getFullName(),
                        saved.getId(),
                        saved.getAmount(),
                        dueAt);
            });
        } catch (Exception ex) {
            log.warn("Failed to send deposit instruction email for request {}: {}",
                    req.getId(), ex.getMessage());
        }
    }

    private void rejectRequest(RentalRequest req, String reason) {
        saveRentalRequestPort.save(req.withStatus(RentalRequestStatus.REJECTED));
        try {
            loadUserPort.loadById(req.getCustomerId()).ifPresent(user -> {
                String roomLabel = resolveRoomLabel(req);
                emailPort.sendDepositRejected(
                        user.getEmail(), user.getFullName(), roomLabel, "", reason);
            });
        } catch (Exception ex) {
            log.warn("Failed to send rejection email for request {}: {}",
                    req.getId(), ex.getMessage());
        }
    }

    private BigDecimal resolvePrice(RentalRequest req) {
        if (req.getBedId() != null) {
            Bed bed = loadBedPort.loadById(req.getBedId()).orElse(null);
            if (bed != null && bed.getPricePerMonth() != null) {
                return bed.getPricePerMonth();
            }
        }
        if (req.getRoomId() != null) {
            Room room = loadRoomPort.loadById(req.getRoomId()).orElse(null);
            if (room != null && room.getPricePerMonth() != null) {
                return room.getPricePerMonth();
            }
        }
        return BigDecimal.ZERO;
    }

    private String resolveRoomLabel(RentalRequest req) {
        if (req.getRoomId() != null) {
            return loadRoomPort
                    .loadById(req.getRoomId())
                    .map(Room::getRoomNumber)
                    .orElse("Room");
        }
        return "Room";
    }
}
