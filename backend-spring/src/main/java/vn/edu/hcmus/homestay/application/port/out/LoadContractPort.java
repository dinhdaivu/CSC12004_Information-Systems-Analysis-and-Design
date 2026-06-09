package vn.edu.hcmus.homestay.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

public interface LoadContractPort {

    Optional<Contract> loadById(UUID id);

    List<Contract> loadAll();

    List<Contract> loadByCustomerId(UUID customerId);
}
