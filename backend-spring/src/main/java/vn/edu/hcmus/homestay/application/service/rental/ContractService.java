package vn.edu.hcmus.homestay.application.service.rental;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateContractUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetContractUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.SignContractUseCase;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveContractPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

@Service
public class ContractService implements CreateContractUseCase, GetContractUseCase, SignContractUseCase {

    private final LoadContractPort loadContractPort;
    private final SaveContractPort saveContractPort;

    public ContractService(LoadContractPort loadContractPort, SaveContractPort saveContractPort) {
        this.loadContractPort = loadContractPort;
        this.saveContractPort = saveContractPort;
    }

    @Override
    public Contract createContract(CreateContractCommand command) {
        Contract contract = new Contract(
                null,
                command.customerId(),
                command.depositRequestId(),
                command.roomId(),
                command.bedId(),
                command.startDate(),
                command.endDate(),
                command.monthlyPrice(),
                ContractStatus.ACTIVE,
                null,
                command.notes(),
                null,
                null);
        return saveContractPort.save(contract);
    }

    @Override
    public Contract getContract(UUID id) {
        return loadContractPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Contract not found"));
    }

    @Override
    public List<Contract> getMyContracts(UUID customerId) {
        return loadContractPort.loadByCustomerId(customerId);
    }

    @Override
    public List<Contract> getAllContracts(ContractFilter filter) {
        List<Contract> all = loadContractPort.loadAll();

        // Apply in-memory filters
        List<Contract> filtered = all.stream()
                .filter(c -> filter.status() == null || c.getStatus() == filter.status())
                .filter(c -> filter.customerId() == null || c.getCustomerId().equals(filter.customerId()))
                .toList();

        // Pagination
        int page = filter.page() > 0 ? filter.page() : 1;
        int limit = filter.limit() > 0 ? filter.limit() : 20;
        int fromIndex = (page - 1) * limit;
        if (fromIndex >= filtered.size()) {
            return List.of();
        }
        int toIndex = Math.min(fromIndex + limit, filtered.size());
        return filtered.subList(fromIndex, toIndex);
    }

    @Override
    public Contract signContract(UUID id, SignContractCommand command) {
        Contract contract = loadContractPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        Contract updated = contract;
        if (command.contractDocumentUrl() != null) {
            updated = updated.withDocumentUrl(command.contractDocumentUrl());
        }
        if (command.notes() != null) {
            updated = updated.withNotes(command.notes());
        }
        return saveContractPort.save(updated);
    }
}
