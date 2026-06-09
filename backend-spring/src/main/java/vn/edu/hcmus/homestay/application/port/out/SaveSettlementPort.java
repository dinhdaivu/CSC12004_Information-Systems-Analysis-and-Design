package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;

public interface SaveSettlementPort {

    Settlement save(Settlement s);
}
