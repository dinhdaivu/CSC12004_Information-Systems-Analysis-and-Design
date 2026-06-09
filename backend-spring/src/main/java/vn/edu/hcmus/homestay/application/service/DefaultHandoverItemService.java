package vn.edu.hcmus.homestay.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.GetDefaultHandoverItemUseCase;
import vn.edu.hcmus.homestay.application.port.in.ManageDefaultHandoverItemUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadDefaultHandoverItemPort;
import vn.edu.hcmus.homestay.application.port.out.SaveDefaultHandoverItemPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

@Service
public class DefaultHandoverItemService
        implements GetDefaultHandoverItemUseCase, ManageDefaultHandoverItemUseCase {

    private final LoadDefaultHandoverItemPort loadDefaultHandoverItemPort;
    private final SaveDefaultHandoverItemPort saveDefaultHandoverItemPort;

    public DefaultHandoverItemService(
            LoadDefaultHandoverItemPort loadDefaultHandoverItemPort,
            SaveDefaultHandoverItemPort saveDefaultHandoverItemPort) {
        this.loadDefaultHandoverItemPort = loadDefaultHandoverItemPort;
        this.saveDefaultHandoverItemPort = saveDefaultHandoverItemPort;
    }

    @Override
    public List<DefaultHandoverItem> listAll() {
        return loadDefaultHandoverItemPort.loadAll();
    }

    @Override
    public List<DefaultHandoverItem> resolve(String roomType) {
        return loadDefaultHandoverItemPort.resolve(roomType);
    }

    @Override
    public DefaultHandoverItem create(CreateDefaultHandoverItemCommand command) {
        DefaultHandoverItem item = new DefaultHandoverItem(
                null,
                command.roomTypeMatch(),
                command.itemName(),
                command.defaultCondition() != null ? command.defaultCondition() : "Good",
                command.sortOrder(),
                true,
                null,
                null);
        return saveDefaultHandoverItemPort.save(item);
    }

    @Override
    public DefaultHandoverItem update(UUID id, UpdateDefaultHandoverItemCommand command) {
        DefaultHandoverItem existing = loadDefaultHandoverItemPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Default handover item not found"));

        DefaultHandoverItem updated = new DefaultHandoverItem(
                existing.getId(),
                command.roomTypeMatch() != null ? command.roomTypeMatch() : existing.getRoomTypeMatch(),
                command.itemName() != null ? command.itemName() : existing.getItemName(),
                command.defaultCondition() != null ? command.defaultCondition() : existing.getDefaultCondition(),
                command.sortOrder() != 0 ? command.sortOrder() : existing.getSortOrder(),
                command.active() != null ? command.active() : existing.isActive(),
                existing.getCreatedAt(),
                existing.getUpdatedAt());
        return saveDefaultHandoverItemPort.save(updated);
    }

    @Override
    public void delete(UUID id) {
        loadDefaultHandoverItemPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Default handover item not found"));
        saveDefaultHandoverItemPort.delete(id);
    }
}
