package vn.edu.hcmus.homestay.adapter.in.scheduler;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
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
    private final SaveDepositPort       saveDepositPort;
    private final LoadRoomPort          loadRoomPort;
    private final LoadBedPort           loadBedPort;
    private final LoadUserPort          loadUserPort;
    private final AsyncEmailSender      asyncEmailSender;

    public PendingRentalRequestScheduler(
            LoadRentalRequestPort loadRentalRequestPort,
            SaveRentalRequestPort saveRentalRequestPort,
            SaveDepositPort saveDepositPort,
            LoadRoomPort loadRoomPort,
            LoadBedPort loadBedPort,
            LoadUserPort loadUserPort,
            AsyncEmailSender asyncEmailSender) {
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.saveRentalRequestPort = saveRentalRequestPort;
        this.saveDepositPort       = saveDepositPort;
        this.loadRoomPort          = loadRoomPort;
        this.loadBedPort           = loadBedPort;
        this.loadUserPort          = loadUserPort;
        this.asyncEmailSender      = asyncEmailSender;
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processPendingRentalRequests() {
        long start = System.currentTimeMillis();
        List<RentalRequest> pending =
                loadRentalRequestPort.loadByStatus(RentalRequestStatus.REQUESTED);
        if (pending.isEmpty()) {
            log.debug("Scheduler tick: 0 pending requests ({}ms)", System.currentTimeMillis() - start);
            return;
        }

        log.info("Processing {} pending rental request(s)", pending.size());

        // Bulk-load all referenced entities — 3 IN queries regardless of N.
        Set<UUID> bedIds = pending.stream()
                .map(RentalRequest::getBedId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> roomIds = pending.stream()
                .map(RentalRequest::getRoomId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> customerIds = pending.stream()
                .map(RentalRequest::getCustomerId)
                .collect(Collectors.toSet());

        Map<UUID, Bed>  bedMap  = toMap(loadBedPort.loadByIds(bedIds),      Bed::getId);
        Map<UUID, Room> roomMap = toMap(loadRoomPort.loadByIds(roomIds),     Room::getId);
        Map<UUID, User> userMap = toMap(loadUserPort.loadByIds(customerIds), User::getId);

        for (RentalRequest req : pending) {
            Bed  bed  = req.getBedId()  != null ? bedMap.get(req.getBedId())   : null;
            Room room = req.getRoomId() != null ? roomMap.get(req.getRoomId()) : null;
            User user = userMap.get(req.getCustomerId());

            boolean available = checkAvailability(bed, room, req);
            boolean genderOk  = checkGenderPolicy(room, user);

            if (available && genderOk) {
                acceptRequest(req, bed, room, user);
            } else {
                rejectRequest(req, room, user,
                        available ? "Gender policy mismatch" : "Room/bed not available");
            }
        }

        log.info("Scheduler tick completed: {} request(s) processed in {}ms",
                pending.size(), System.currentTimeMillis() - start);
    }

    // ── helpers (pure map lookups — zero extra DB calls inside the loop) ──────

    private boolean checkAvailability(Bed bed, Room room, RentalRequest req) {
        if (req.getBedId() != null) {
            return bed != null && bed.getStatus() == BedStatus.AVAILABLE;
        }
        if (req.getRoomId() != null) {
            return room != null && room.getStatus() == RoomStatus.AVAILABLE;
        }
        return false;
    }

    private boolean checkGenderPolicy(Room room, User user) {
        if (room == null
                || room.getGenderPolicy() == null
                || room.getGenderPolicy() == GenderPolicy.MIXED) {
            return true;
        }
        if (user == null || user.getGender() == null) return true;
        return room.getGenderPolicy().name().equals(user.getGender().toUpperCase());
    }

    private void acceptRequest(RentalRequest req, Bed bed, Room room, User user) {
        BigDecimal price = resolvePrice(bed, room);
        Instant    dueAt = Instant.now().plus(24, ChronoUnit.HOURS);

        DepositRequest deposit = new DepositRequest(
                null, req.getId(), req.getCustomerId(),
                req.getRoomId(), req.getBedId(),
                price.multiply(BigDecimal.TWO),
                dueAt, null, null, null, null,
                DepositStatus.PENDING, null, null);

        DepositRequest saved = saveDepositPort.save(deposit);
        saveRentalRequestPort.save(req.withStatus(RentalRequestStatus.DEPOSIT_PENDING));

        // Fire-and-forget: email sends after transaction on a thread pool thread.
        if (user != null) {
            asyncEmailSender.sendDepositInstruction(
                    user.getEmail(), user.getFullName(),
                    saved.getId(), saved.getAmount(), dueAt);
        }
    }

    private void rejectRequest(RentalRequest req, Room room, User user, String reason) {
        saveRentalRequestPort.save(req.withStatus(RentalRequestStatus.REJECTED));

        // Fire-and-forget: email sends after transaction on a thread pool thread.
        if (user != null) {
            String roomLabel = room != null ? room.getRoomNumber() : "Room";
            asyncEmailSender.sendDepositRejected(
                    user.getEmail(), user.getFullName(), roomLabel, reason);
        }
    }

    private BigDecimal resolvePrice(Bed bed, Room room) {
        if (bed  != null && bed.getPricePerMonth()  != null) return bed.getPricePerMonth();
        if (room != null && room.getPricePerMonth() != null) return room.getPricePerMonth();
        return BigDecimal.ZERO;
    }

    private static <T> Map<UUID, T> toMap(List<T> items, Function<T, UUID> keyFn) {
        return items.stream().collect(Collectors.toMap(keyFn, Function.identity()));
    }
}
