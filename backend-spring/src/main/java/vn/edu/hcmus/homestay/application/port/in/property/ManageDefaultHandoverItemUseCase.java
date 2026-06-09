package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

public interface ManageDefaultHandoverItemUseCase {

    DefaultHandoverItem create(CreateDefaultHandoverItemCommand command);

    DefaultHandoverItem update(UUID id, UpdateDefaultHandoverItemCommand command);

    void delete(UUID id);

    record CreateDefaultHandoverItemCommand(
            String roomTypeMatch,
            String itemName,
            String defaultCondition,
            int sortOrder) {}

    record UpdateDefaultHandoverItemCommand(
            String roomTypeMatch,
            String itemName,
            String defaultCondition,
            int sortOrder,
            Boolean active) {}
}
