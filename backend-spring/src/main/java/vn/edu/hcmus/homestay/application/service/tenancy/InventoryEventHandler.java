package vn.edu.hcmus.homestay.application.service.tenancy;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveBedPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveRoomPort;
import vn.edu.hcmus.homestay.domain.event.CheckoutCompletedEvent;
import vn.edu.hcmus.homestay.domain.event.DepositConfirmedEvent;
import vn.edu.hcmus.homestay.domain.event.DepositExpiredEvent;
import vn.edu.hcmus.homestay.domain.event.HandoverCompletedEvent;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

/**
 * Handles domain lifecycle events and keeps room/bed inventory availability in sync.
 * Renamed from CatalogEventHandler — "catalog" was misleading; this manages availability state.
 */
@Component
public class InventoryEventHandler {

    private final LoadRoomPort loadRoomPort;
    private final SaveRoomPort saveRoomPort;
    private final LoadBedPort loadBedPort;
    private final SaveBedPort saveBedPort;

    public InventoryEventHandler(
            LoadRoomPort loadRoomPort,
            SaveRoomPort saveRoomPort,
            LoadBedPort loadBedPort,
            SaveBedPort saveBedPort) {
        this.loadRoomPort = loadRoomPort;
        this.saveRoomPort = saveRoomPort;
        this.loadBedPort = loadBedPort;
        this.saveBedPort = saveBedPort;
    }

    @EventListener
    @Transactional
    public void onDepositConfirmed(DepositConfirmedEvent event) {
        loadRoomPort.loadById(event.roomId()).ifPresent(room -> {
            Room updated = new Room(
                    room.getId(),
                    room.getBranchId(),
                    room.getRoomNumber(),
                    room.getRoomType(),
                    room.getMaxCapacity(),
                    room.getPricePerMonth(),
                    room.getAmenities(),
                    room.getImagesUrl(),
                    RoomStatus.DEPOSITED,
                    room.getCreatedAt(),
                    room.getUpdatedAt());
            saveRoomPort.save(updated);
        });

        if (event.bedId() != null) {
            loadBedPort.loadById(event.bedId()).ifPresent(bed -> {
                Bed updated = new Bed(
                        bed.getId(),
                        bed.getRoomId(),
                        bed.getBedNumber(),
                        bed.getPricePerMonth(),
                        BedStatus.OCCUPIED,
                        bed.getCreatedAt(),
                        bed.getUpdatedAt());
                saveBedPort.save(updated);
            });
        }
    }

    @EventListener
    @Transactional
    public void onHandoverCompleted(HandoverCompletedEvent event) {
        loadRoomPort.loadById(event.roomId()).ifPresent(room -> {
            Room updated = new Room(
                    room.getId(),
                    room.getBranchId(),
                    room.getRoomNumber(),
                    room.getRoomType(),
                    room.getMaxCapacity(),
                    room.getPricePerMonth(),
                    room.getAmenities(),
                    room.getImagesUrl(),
                    RoomStatus.OCCUPIED,
                    room.getCreatedAt(),
                    room.getUpdatedAt());
            saveRoomPort.save(updated);
        });

        if (event.bedId() != null) {
            loadBedPort.loadById(event.bedId()).ifPresent(bed -> {
                Bed updated = new Bed(
                        bed.getId(),
                        bed.getRoomId(),
                        bed.getBedNumber(),
                        bed.getPricePerMonth(),
                        BedStatus.OCCUPIED,
                        bed.getCreatedAt(),
                        bed.getUpdatedAt());
                saveBedPort.save(updated);
            });
        }
    }

    @EventListener
    @Transactional
    public void onCheckoutCompleted(CheckoutCompletedEvent event) {
        loadRoomPort.loadById(event.roomId()).ifPresent(room -> {
            Room updated = new Room(
                    room.getId(),
                    room.getBranchId(),
                    room.getRoomNumber(),
                    room.getRoomType(),
                    room.getMaxCapacity(),
                    room.getPricePerMonth(),
                    room.getAmenities(),
                    room.getImagesUrl(),
                    RoomStatus.AVAILABLE,
                    room.getCreatedAt(),
                    room.getUpdatedAt());
            saveRoomPort.save(updated);
        });

        if (event.bedId() != null) {
            loadBedPort.loadById(event.bedId()).ifPresent(bed -> {
                Bed updated = new Bed(
                        bed.getId(),
                        bed.getRoomId(),
                        bed.getBedNumber(),
                        bed.getPricePerMonth(),
                        BedStatus.AVAILABLE,
                        bed.getCreatedAt(),
                        bed.getUpdatedAt());
                saveBedPort.save(updated);
            });
        }
    }

    @EventListener
    @Transactional
    public void onDepositExpired(DepositExpiredEvent event) {
        loadRoomPort.loadById(event.roomId()).ifPresent(room -> {
            Room updated = new Room(
                    room.getId(),
                    room.getBranchId(),
                    room.getRoomNumber(),
                    room.getRoomType(),
                    room.getMaxCapacity(),
                    room.getPricePerMonth(),
                    room.getAmenities(),
                    room.getImagesUrl(),
                    RoomStatus.AVAILABLE,
                    room.getCreatedAt(),
                    room.getUpdatedAt());
            saveRoomPort.save(updated);
        });

        if (event.bedId() != null) {
            loadBedPort.loadById(event.bedId()).ifPresent(bed -> {
                Bed updated = new Bed(
                        bed.getId(),
                        bed.getRoomId(),
                        bed.getBedNumber(),
                        bed.getPricePerMonth(),
                        BedStatus.AVAILABLE,
                        bed.getCreatedAt(),
                        bed.getUpdatedAt());
                saveBedPort.save(updated);
            });
        }
    }
}
