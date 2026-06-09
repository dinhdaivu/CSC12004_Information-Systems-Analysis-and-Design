package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

public interface GetContractUseCase {

    Contract getContract(UUID id);

    List<Contract> getMyContracts(UUID customerId);

    List<Contract> getAllContracts(ContractFilter filter);

    record ContractFilter(int page, int limit, ContractStatus status, UUID customerId) {}
}
