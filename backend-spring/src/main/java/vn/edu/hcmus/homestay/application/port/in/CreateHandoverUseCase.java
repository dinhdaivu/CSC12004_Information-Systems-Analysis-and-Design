package vn.edu.hcmus.homestay.application.port.in;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverAggregate;

public interface CreateHandoverUseCase {

    HandoverAggregate createHandover(CreateHandoverCommand command);

    record CreateHandoverCommand(
            UUID contractId,
            UUID managerId,
            UUID customerId,
            Instant handoverAt,
            String notes,
            List<HandoverItemCommand> items) {}

    record HandoverItemCommand(String itemName, String itemCondition, String notes) {}
}
