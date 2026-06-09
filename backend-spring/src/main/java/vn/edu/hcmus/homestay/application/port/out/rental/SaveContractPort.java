package vn.edu.hcmus.homestay.application.port.out.rental;

import vn.edu.hcmus.homestay.domain.model.contract.Contract;

public interface SaveContractPort {

    Contract save(Contract contract);
}
