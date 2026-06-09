package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverAggregate;

public interface UpdateHandoverUseCase {

    HandoverAggregate completeHandover(UUID id, UUID managerId);

    HandoverAggregate cancelHandover(UUID id);

    HandoverAggregate signHandover(UUID id, SignHandoverCommand command);

    HandoverAggregate addHandoverItem(UUID handoverId, CreateHandoverUseCase.HandoverItemCommand item);

    record SignHandoverCommand(String managerSignatureUrl, String customerSignatureUrl) {}
}
