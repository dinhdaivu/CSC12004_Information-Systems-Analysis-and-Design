package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;

public interface SaveHandoverPort {

    Handover save(Handover handover);

    HandoverItem saveItem(HandoverItem item);
}
