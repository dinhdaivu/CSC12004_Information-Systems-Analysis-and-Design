package vn.edu.hcmus.homestay.application.port.in.tenancy;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.application.model.query.HandoverDetailView;

public interface CreateHandoverUseCase {

    HandoverDetailView createHandover(CreateHandoverCommand command);

    record CreateHandoverCommand(
            UUID contractId,
            UUID managerId,
            UUID customerId,
            Instant handoverAt,
            String notes,
            List<HandoverItemCommand> items) {}

    record HandoverItemCommand(String itemName, String itemCondition, String notes) {}
}
