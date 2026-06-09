package vn.edu.hcmus.homestay.application.port.out.dispute;

import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;

public interface SaveDisputePort {

    Dispute save(Dispute d);
}
