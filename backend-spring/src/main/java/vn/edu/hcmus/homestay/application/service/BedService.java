package vn.edu.hcmus.homestay.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.CreateBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.DeleteBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateBedUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadBedPort;
import vn.edu.hcmus.homestay.application.port.out.LoadRoomPort;
import vn.edu.hcmus.homestay.application.port.out.SaveBedPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;

@Service
public class BedService implements CreateBedUseCase, GetBedUseCase, UpdateBedUseCase, DeleteBedUseCase {

    private final LoadBedPort loadBedPort;
    private final SaveBedPort saveBedPort;
    private final LoadRoomPort loadRoomPort;

    public BedService(
            LoadBedPort loadBedPort,
            SaveBedPort saveBedPort,
            LoadRoomPort loadRoomPort) {
        this.loadBedPort = loadBedPort;
        this.saveBedPort = saveBedPort;
        this.loadRoomPort = loadRoomPort;
    }

    @Override
    public Bed createBed(UUID roomId, CreateBedCommand command) {
        loadRoomPort
                .loadById(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found"));

        if (loadBedPort.existsByRoomIdAndBedNumber(roomId, command.bedNumber())) {
            throw new ConflictException("A bed with this number already exists in the room");
        }

        Bed bed = new Bed(
                null,
                roomId,
                command.bedNumber(),
                command.pricePerMonth(),
                BedStatus.AVAILABLE,
                null,
                null);
        return saveBedPort.save(bed);
    }

    @Override
    public Bed getBed(UUID id) {
        return loadBedPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Bed not found"));
    }

    @Override
    public List<Bed> listBedsByRoom(UUID roomId) {
        return loadBedPort.loadByRoomId(roomId);
    }

    @Override
    public Bed updateBed(UUID id, UpdateBedCommand command) {
        Bed existing = loadBedPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Bed not found"));

        if (command.bedNumber() != null
                && !command.bedNumber().equals(existing.getBedNumber())
                && loadBedPort.existsByRoomIdAndBedNumber(existing.getRoomId(), command.bedNumber())) {
            throw new ConflictException("A bed with this number already exists in the room");
        }

        Bed updated = new Bed(
                existing.getId(),
                existing.getRoomId(),
                command.bedNumber() != null ? command.bedNumber() : existing.getBedNumber(),
                command.pricePerMonth() != null ? command.pricePerMonth() : existing.getPricePerMonth(),
                command.status() != null ? command.status() : existing.getStatus(),
                existing.getCreatedAt(),
                existing.getUpdatedAt());
        return saveBedPort.save(updated);
    }

    @Override
    public void deleteBed(UUID id) {
        loadBedPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Bed not found"));
        saveBedPort.delete(id);
    }
}
