package vn.edu.hcmus.homestay.application.port.in.tenancy;

import java.util.UUID;
import vn.edu.hcmus.homestay.application.model.query.HandoverDetailView;

public interface UpdateHandoverUseCase {

    HandoverDetailView completeHandover(UUID id);

    HandoverDetailView cancelHandover(UUID id);

    HandoverDetailView signHandover(UUID id, SignHandoverCommand command);

    HandoverDetailView addHandoverItem(UUID handoverId, CreateHandoverUseCase.HandoverItemCommand item);

    record SignHandoverCommand(String managerSignatureUrl, String customerSignatureUrl) {}
}
