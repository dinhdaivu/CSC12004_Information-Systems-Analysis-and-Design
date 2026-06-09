package vn.edu.hcmus.homestay.application.port.in.tenancy;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.application.model.query.HandoverDetailView;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;

public interface GetHandoverUseCase {

    HandoverDetailView getHandover(UUID id);

    List<Handover> listHandovers(HandoverFilter filter);

    record HandoverFilter(UUID contractId, UUID customerId, HandoverStatus status) {}
}
